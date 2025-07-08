import { apiService } from './api.js';

export const BillingService = {
  async getMonthlyBillingData(customerId = null, corporateGroupId) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 12);
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const query = {
        select: `
          dt_emissao,
          valor_orig,
          customer_id,
          company_id
        `,
        gte: { dt_emissao: formatDate(startDate) },
        lte: { dt_emissao: formatDate(endDate) },
        order: { column: 'dt_emissao', ascending: true }
      };

      if (customerId) {
        query.eq = { customer_id: customerId };
      }

      const faturas = await apiService.supabaseSelect('faturas', query);

      if (corporateGroupId && !customerId) {
        const companies = await apiService.supabaseSelect('company', {
          select: 'id',
          eq: { corporate_group_id: corporateGroupId }
        });
        
        const companyIds = companies.map(c => c.id);
        const filteredFaturas = faturas.filter(f => companyIds.includes(f.company_id));
        return this.processBillingData(filteredFaturas);
      }

      return this.processBillingData(faturas);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      throw error;
    }
  },

  processBillingData(faturas) {
    const endDate = new Date();
    const months = [];
    
    const getMonthKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };
    
    const getMonthLabel = (date) => {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[date.getMonth()];
    };
    
    for (let i = 12; i >= 0; i--) {
      const monthDate = new Date(endDate);
      monthDate.setMonth(endDate.getMonth() - i);
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      
      months.push({
        date: firstDay,
        key: getMonthKey(monthDate),
        label: getMonthLabel(monthDate),
        value: 0
      });
    }

    faturas.forEach(fatura => {
      const faturaDate = new Date(fatura.dt_emissao);
      const faturaMonth = getMonthKey(faturaDate);
      const monthData = months.find(m => m.key === faturaMonth);
      
      if (monthData) {
        monthData.value += parseFloat(fatura.valor_orig || 0);
      }
    });

    return months.map(({ date, label, value }) => ({
      month: label,
      value,
      date
    }));
  },

  calculateBillingMetrics(billingData) {
    if (!billingData || billingData.length < 6) {
      return {
        currentAverage: 0,
        previousAverage: 0,
        variation: 0,
        variationPercentage: 0
      };
    }

    // Últimos 3 meses (d-1, d-2, d-3)
    const last3Months = billingData.slice(-3);
    // 3 meses anteriores (d-2, d-3, d-4) - overlapping with last3Months
    const previous3Months = billingData.slice(-4, -1);

    const currentAverage = last3Months.reduce((sum, item) => sum + item.value, 0) / 3;
    const previousAverage = previous3Months.reduce((sum, item) => sum + item.value, 0) / 3;

    // Fórmula especificada: 1 - (((d-1 + d-2 + d-3)/3) / ((d-2 + d-3 + d-4)/3))
    let variationPercentage = 0;
    if (previousAverage > 0) {
      variationPercentage = (1 - (currentAverage / previousAverage)) * 100;
    }

    const variation = currentAverage - previousAverage;

    return {
      currentAverage,
      previousAverage,
      variation,
      variationPercentage: -variationPercentage // Invertendo o sinal para ficar mais intuitivo
    };
  },

  async getCreditLimitOccupation(customerId, billingData) {
    try {
      if (!customerId) return billingData.map(item => ({ ...item, occupation: 0 }));

      const customer = await apiService.supabaseSelect('customer', {
        select: 'credit_limits_id',
        eq: { id: customerId },
        single: true
      });

      if (!customer?.credit_limits_id) {
        return billingData.map(item => ({ ...item, occupation: 0 }));
      }

      const creditLimit = await apiService.supabaseSelect('credit_limit_amount', {
        select: 'credit_limit',
        eq: { id: customer.credit_limits_id },
        single: true
      });

      const creditLimitValue = creditLimit?.credit_limit || 0;

      if (creditLimitValue === 0) {
        return billingData.map(item => ({ ...item, occupation: 0 }));
      }

      return billingData.map(item => ({
        ...item,
        occupation: (item.value / creditLimitValue) * 100
      }));
    } catch (error) {
      console.error('Error calculating credit limit occupation:', error);
      return billingData.map(item => ({ ...item, occupation: 0 }));
    }
  },

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  formatCompactCurrency(value) {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return this.formatCurrency(value);
  }
};