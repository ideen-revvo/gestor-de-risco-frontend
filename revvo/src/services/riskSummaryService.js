import { apiService } from './api.js';

export const RiskSummaryService = {
  async getRiskSummaryData(customerId, corporateGroupId) {
    try {
      if (!customerId) {
        return this.getMockRiskData();
      }

      console.log('Fetching risk summary data for customer:', customerId);

      // 1. Buscar dados do limite de crédito do SAP
      const creditLimitData = await this.getCreditLimitFromSAP(customerId);
      
      // 2. Buscar faturas e parcelas do Supabase
      const invoicesData = await this.getInvoicesData(customerId, corporateGroupId);
      
      // 3. Calcular indicadores baseados nos dados reais
      const riskSummary = this.calculateRiskIndicators(creditLimitData, invoicesData);
      
      console.log('Risk summary calculated:', riskSummary);
      return riskSummary;
    } catch (error) {
      console.error('Error fetching risk summary data:', error);
      // Em caso de erro, retorna dados mock para não quebrar a interface
      return this.getMockRiskData();
    }
  },

  async getCreditLimitFromSAP(customerId) {
    try {
      // Buscar dados do cliente no Supabase para obter o company_code
      const customer = await apiService.supabaseSelect('customer', {
        select: 'company_code, credit_limits_id',
        eq: { id: customerId },
        single: true
      });

      if (!customer?.company_code) {
        console.warn('Customer company_code not found, using Supabase data');
        return await this.getCreditLimitFromSupabase(customer?.credit_limits_id);
      }

      // Buscar dados de limite de crédito no SAP
      const sapResponse = await apiService.sapRequest('ZUKM_DB_UKMBP_CMS_EXECUTE', {
        IV_PARTNER: customer.company_code
      });

      if (sapResponse && sapResponse.EV_CREDIT_LIMIT) {
        const creditLimit = parseFloat(sapResponse.EV_CREDIT_LIMIT) || 0;
        const creditLimitUsed = parseFloat(sapResponse.EV_CREDIT_EXPOSURE) || 0;

        return {
          creditLimit,
          creditLimitUsed,
          fromSAP: true
        };
      }

      // Fallback para dados do Supabase se SAP não retornar dados
      return await this.getCreditLimitFromSupabase(customer?.credit_limits_id);
    } catch (error) {
      console.error('Error fetching credit limit from SAP:', error);
      // Fallback para Supabase em caso de erro no SAP
      const customer = await apiService.supabaseSelect('customer', {
        select: 'credit_limits_id',
        eq: { id: customerId },
        single: true
      });
      return await this.getCreditLimitFromSupabase(customer?.credit_limits_id);
    }
  },

  async getCreditLimitFromSupabase(creditLimitsId) {
    try {
      if (!creditLimitsId) {
        return { creditLimit: 0, creditLimitUsed: 0, fromSAP: false };
      }

      const creditLimitAmount = await apiService.supabaseSelect('credit_limit_amount', {
        select: 'credit_limit, credit_limit_used',
        eq: { id: creditLimitsId },
        single: true
      });

      return {
        creditLimit: parseFloat(creditLimitAmount?.credit_limit) || 0,
        creditLimitUsed: parseFloat(creditLimitAmount?.credit_limit_used) || 0,
        fromSAP: false
      };
    } catch (error) {
      console.error('Error fetching credit limit from Supabase:', error);
      return { creditLimit: 0, creditLimitUsed: 0, fromSAP: false };
    }
  },

  async getInvoicesData(customerId, corporateGroupId) {
    try {
      // Buscar todas as empresas do grupo corporativo
      const companies = await apiService.supabaseSelect('company', {
        select: 'id',
        eq: { corporate_group_id: corporateGroupId }
      });

      const companyIds = companies.map(c => c.id);

      if (companyIds.length === 0) {
        return { faturas: [], parcelas: [] };
      }

      const endDate = new Date();
      const startDate12Months = new Date();
      startDate12Months.setMonth(endDate.getMonth() - 12);

      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      // Buscar faturas do cliente nas empresas do grupo
      const faturas = await apiService.supabaseSelect('faturas', {
        select: `
          id,
          dt_emissao,
          dt_vencimento,
          valor_orig,
          customer_id,
          company_id
        `,
        eq: { customer_id: customerId },
        in: { company_id: companyIds },
        gte: { dt_emissao: formatDate(startDate12Months) },
        order: { column: 'dt_emissao', ascending: false }
      });

      console.log(`Found ${faturas.length} invoices for customer ${customerId}`);

      // Buscar parcelas das faturas
      const faturaIds = faturas.map(f => f.id);
      let parcelas = [];
      
      if (faturaIds.length > 0) {
        parcelas = await apiService.supabaseSelect('parcelas_fat', {
          select: `
            id,
            fat_id,
            dt_vencimento,
            valor_parc,
            dt_pagamento,
            valor_pago
          `,
          in: { fat_id: faturaIds },
          order: { column: 'dt_vencimento', ascending: true }
        });
      }

      console.log(`Found ${parcelas.length} installments for customer ${customerId}`);

      return { faturas, parcelas };
    } catch (error) {
      console.error('Error fetching invoices data:', error);
      return { faturas: [], parcelas: [] };
    }
  },

  calculateRiskIndicators(creditLimitData, invoicesData) {
    const { faturas, parcelas } = invoicesData;
    const today = new Date();

    console.log('Calculating risk indicators with:', {
      creditLimitData,
      faturasCount: faturas.length,
      parcelasCount: parcelas.length
    });

    // 1. Limite de Crédito Concedido
    const creditLimitGranted = creditLimitData.creditLimit;

    // 2. Limite de crédito utilizado (%)
    const creditLimitUsedAmount = creditLimitData.creditLimitUsed || 0;
    const creditLimitUsed = creditLimitGranted > 0 
      ? Math.round((creditLimitUsedAmount / creditLimitGranted) * 100) 
      : 0;

    // 3. A Receber (R$) = Valor faturado não recebido
    const amountToReceive = parcelas
      .filter(p => {
        const valorPago = parseFloat(p.valor_pago || 0);
        const valorParcela = parseFloat(p.valor_parc || 0);
        return !p.dt_pagamento || valorPago < valorParcela;
      })
      .reduce((sum, p) => {
        const valorPago = parseFloat(p.valor_pago || 0);
        const valorParcela = parseFloat(p.valor_parc || 0);
        return sum + (valorParcela - valorPago);
      }, 0);

    // 4. Prazo médio de Pagamento
    const avgPaymentTerm = this.calculateAvgPaymentTerm(faturas, parcelas);

    // 5. Status - Vencido e valores em atraso
    const overdueData = this.calculateOverdueData(parcelas, today);

    // 6. Máx. dias em atraso (últimos 12 meses)
    const maxDelayDays12Months = this.calculateMaxDelayDays(parcelas, today);

    const result = {
      creditLimitGranted,
      creditLimitUsed,
      amountToReceive,
      avgPaymentTerm,
      isOverdue: overdueData.isOverdue,
      overdueAmount: overdueData.overdueAmount,
      avgDelayDays: overdueData.avgDelayDays,
      maxDelayDays12Months
    };

    console.log('Risk indicators calculated:', result);
    return result;
  },

  calculateAvgPaymentTerm(faturas, parcelas) {
    if (faturas.length === 0 || parcelas.length === 0) {
      console.log('No invoices or installments found, using default payment term');
      return 30; // Padrão mais conservador
    }

    let totalDays = 0;
    let count = 0;

    faturas.forEach(fatura => {
      const faturaParcelas = parcelas.filter(p => p.fat_id === fatura.id);
      
      faturaParcelas.forEach(parcela => {
        try {
          const dtEmissao = new Date(fatura.dt_emissao);
          const dtVencimento = new Date(parcela.dt_vencimento);
          
          if (isNaN(dtEmissao.getTime()) || isNaN(dtVencimento.getTime())) {
            return; // Pular datas inválidas
          }
          
          const daysDiff = Math.ceil((dtVencimento - dtEmissao) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0 && daysDiff <= 365) { // Validar prazo razoável
            totalDays += daysDiff;
            count++;
          }
        } catch (error) {
          console.error('Error calculating payment term for installment:', parcela.id, error);
        }
      });
    });

    const avgTerm = count > 0 ? Math.round(totalDays / count) : 30;
    console.log(`Average payment term calculated: ${avgTerm} days (from ${count} installments)`);
    return avgTerm;
  },

  calculateOverdueData(parcelas, today) {
    const parcelasVencidas = parcelas.filter(p => {
      try {
        const dtVencimento = new Date(p.dt_vencimento);
        
        if (isNaN(dtVencimento.getTime())) {
          return false; // Pular datas inválidas
        }
        
        const valorPago = parseFloat(p.valor_pago || 0);
        const valorParcela = parseFloat(p.valor_parc || 0);
        const isPaid = p.dt_pagamento && valorPago >= valorParcela;
        
        return dtVencimento < today && !isPaid;
      } catch (error) {
        console.error('Error checking overdue status for installment:', p.id, error);
        return false;
      }
    });

    console.log(`Found ${parcelasVencidas.length} overdue installments`);

    if (parcelasVencidas.length === 0) {
      return {
        isOverdue: false,
        overdueAmount: 0,
        avgDelayDays: 0
      };
    }

    // Valor em atraso
    const overdueAmount = parcelasVencidas.reduce((sum, p) => {
      const valorPago = parseFloat(p.valor_pago || 0);
      const valorParcela = parseFloat(p.valor_parc || 0);
      return sum + (valorParcela - valorPago);
    }, 0);

    // Atraso médio em dias
    const totalDelayDays = parcelasVencidas.reduce((sum, p) => {
      try {
        const dtVencimento = new Date(p.dt_vencimento);
        const delayDays = Math.ceil((today - dtVencimento) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, delayDays); // Garantir que não seja negativo
      } catch (error) {
        console.error('Error calculating delay days for installment:', p.id, error);
        return sum;
      }
    }, 0);

    const avgDelayDays = parcelasVencidas.length > 0 
      ? Math.round(totalDelayDays / parcelasVencidas.length) 
      : 0;

    console.log(`Overdue data calculated: ${overdueAmount} amount, ${avgDelayDays} avg delay days`);

    return {
      isOverdue: true,
      overdueAmount,
      avgDelayDays
    };
  },

  calculateMaxDelayDays(parcelas, today) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    let maxDelayDays = 0;

    parcelas.forEach(parcela => {
      try {
        const dtVencimento = new Date(parcela.dt_vencimento);
        
        if (isNaN(dtVencimento.getTime())) {
          return; // Pular datas inválidas
        }
        
        // Considerar apenas parcelas dos últimos 12 meses
        if (dtVencimento >= twelveMonthsAgo) {
          let delayEndDate = today;
          
          // Se foi paga, usar a data de pagamento como fim do atraso
          if (parcela.dt_pagamento) {
            const dtPagamento = new Date(parcela.dt_pagamento);
            if (!isNaN(dtPagamento.getTime())) {
              delayEndDate = dtPagamento;
            }
          }
          
          // Calcular dias de atraso apenas se venceu
          if (dtVencimento < delayEndDate) {
            const delayDays = Math.ceil((delayEndDate - dtVencimento) / (1000 * 60 * 60 * 24));
            maxDelayDays = Math.max(maxDelayDays, Math.max(0, delayDays));
          }
        }
      } catch (error) {
        console.error('Error calculating max delay days for installment:', parcela.id, error);
      }
    });

    console.log(`Max delay days in 12 months: ${maxDelayDays}`);
    return maxDelayDays;
  },

  formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  formatCompactCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'R$ 0';
    }
    
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return this.formatCurrency(value);
  }
};