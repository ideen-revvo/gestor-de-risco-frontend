import React, { useState, useEffect } from 'react';
import { FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { CheckCircle, Circle, Clock, User } from '@phosphor-icons/react';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { DEFAULT_COMPANY_ID } from '../../constants/defaults';
import { format } from 'date-fns';
import OrdersTable from '../OrdersTable';

const Header = styled.header`
  margin-bottom: 24px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 8px;
  margin: 24px 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .filter-toggle {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .filter-content {
    padding: 24px;
    background: #F8F9FA;

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text);
      margin-bottom: 8px;
    }

    select {
      height: 40px;
      padding: 0 12px;
    }
  }

  .customer-details {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .company-info {
        h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        p {
          font-size: 14px;
          color: var(--secondary-text);
        }
      }

      .website {
        font-size: 14px;
        color: var(--primary-blue);
      }
    }

    .info-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;

      .field {
        h4 {
          font-size: 13px;
          color: var(--secondary-text);
          margin-bottom: 4px;
        }

        p {
          font-size: 14px;
        }
      }

      .contacts {
        grid-column: 1 / -1;

        .contact-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .contact {
          background: white;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);

          .name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .info {
            font-size: 13px;
            color: var(--secondary-text);

            p {
              margin-bottom: 4px;
            }
          }
        }
      }
    }
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid var(--border-color);
  }
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0;

  span {
    font-size: 14px;
    margin-left: 8px;
  }
`;

const CardSubtitle = styled.div`
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 24px;
`;

const RequestCard = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  cursor: pointer;

  &.selected {
    border-color: var(--primary-blue);
    min-width: 400px;
  }

  .items-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    h4 {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--secondary-text);
      margin-bottom: 8px;
    }

    .item {
      margin-bottom: 8px;

      .item-name {
        font-size: 14px;
        margin-bottom: 4px;
      }

      .item-details {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--secondary-text);
      }
    }
  }
`;

const DetailView = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  border-radius: 8px;
  padding: 24px;
  flex: 1;
  position: relative;
  min-height: 400px;

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    color: var(--secondary-text);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 24px;
  }

  .detail-section {
    background: #F8F9FA;
    border-radius: 8px;
    padding: 16px;

    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &.score-section {
      text-align: center;

      .score-value {
        font-size: 32px;
        font-weight: 600;
        color: var(--success);
        margin: 16px 0;
      }

      .score-label {
        font-size: 14px;
        color: var(--secondary-text);
      }
    }

    .occurrence-count {
      background: var(--primary-blue);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .occurrence-item {
      padding: 12px;
      background: white;
      border-radius: 4px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .date {
        font-size: 12px;
        color: var(--secondary-text);
        margin-bottom: 4px;
      }

      .value {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .details {
        font-size: 13px;
        color: var(--secondary-text);
      }
    }

    .no-occurrences {
      text-align: center;
      padding: 24px;
      color: var(--secondary-text);
      font-size: 14px;
    }
  }
`;

const StepDetails = styled.div`
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--background);
  padding: 8px;
`;

const StepItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &.current {
    background: #F8F9FA;
    border: 2px solid #2563EB;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
  }

  .subtitle {
    font-size: 13px;
    color: var(--secondary-text);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 24px;
    width: 500px;
    max-width: 90%;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }
  
  .form-field {
    margin-bottom: 16px;
    
    .label {
      font-size: 13px;
      color: var(--secondary-text);
      margin-bottom: 4px;
    }
    
    textarea {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      resize: vertical;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    
    button {
      padding: 6px 16px;
      height: 32px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
      
      &.reject {
        background: #DC2626;
        color: white;
      }
      
      &.approve {
        background: #059669;
        color: white;
      }
    }
  }
`;

const HistoryAnalysisContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
`

const CustomerHistory = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  height: 100%;
  overflow-y: auto;
  weight
`;

const FinancialAnalysisContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  h4 {
    margin-bottom: 16px;
    font-weight: 500;
    color: black;
  }
  
  .load-calculated-limit {
    position: absolute;
    top: 24px;
    right: 24px;
    padding: 6px 12px;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &:hover {
      background: #2563EB;
    }
    
    &:disabled {
      background: #93C5FD;
      cursor: not-allowed;
    }
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text);
      margin-bottom: 8px;
    }
    
    input {
      width: 100%;
      height: 40px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0 12px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
    }
    
    textarea {
      width: 100%;
      min-height: 150px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 12px;
      font-size: 14px;
      resize: vertical;
      
      &:focus {
        outline: none;
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
    }
    
    .prefix {
      position: relative;
      
      input {
        padding-left: 34px;
      }
      
      &:before {
        content: "R$";
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--secondary-text);
      }
    }
    
    .file-upload {
      margin-top: 12px;
      
      .upload-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--background);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 13px;
        color: var(--secondary-text);
        cursor: pointer;
        
        &:hover {
          background: #f3f4f6;
        }
        
        input[type="file"] {
          display: none;
        }
      }
      
      .file-list {
        margin-top: 12px;
        
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--background);
          border-radius: 4px;
          margin-bottom: 8px;
          
          .file-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
          }
          
          .file-actions {
            display: flex;
            gap: 8px;
            
            button {
              background: none;
              border: none;
              cursor: pointer;
              color: var(--secondary-text);
              padding: 4px;
              
              &:hover {
                color: var(--primary-text);
              }
              
              &.delete {
                &:hover {
                  color: #DC2626;
                }
              }
            }
          }
        }
      }
    }
  }
  
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 160px;
    
    button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center; /* Centraliza o texto */

      &.primary {
        background-color: var(--primary-blue);
        color: white;
        border: none;
      }
      
      &.secondary {
        background-color: white;
        color: var(--primary-text);
        border: 1px solid var(--border-color);
      }
    }
  }
`;

const stackedBarData = [
  { month: 'Jan', pedidos: 120, taxaAprovacao: 75 },
  { month: 'Fev', pedidos: 150, taxaAprovacao: 80 },
  { month: 'Mar', pedidos: 180, taxaAprovacao: 85 },
  { month: 'Abr', pedidos: 220, taxaAprovacao: 73 },
  { month: 'Mai', pedidos: 250, taxaAprovacao: 78 },
  { month: 'Jun', pedidos: 300, taxaAprovacao: 82 }
];

const mockOrderItems = [
  { name: 'Implante Mamário Redondo', quantity: 2, unitPrice: 2500.00, total: 5000.00 },
  { name: 'Implante Facial Mentoplastia', quantity: 3, unitPrice: 1800.00, total: 5400.00 }
];

const mockDetailData = {
  SinteseCadastral: {
    Documento: '12.345.678/0001-90',
    Nome: 'Clínica Estética Bella Vita',
    DataFundacao: '15/03/2010',
    SituacaoRFB: 'Ativa'
  },
  SerasaScoreEmpresas: {
    Score: 850,
    Classificacao: 'Risco Baixo'
  },
  PendenciasFinanceiras: {
    TotalOcorrencias: 2,
    PendenciasFinanceirasDetalhe: [
      { DataOcorrencia: '10/01/2024', Valor: '1.500,00', TipoAnotacaoDescricao: 'Título Vencido' },
      { DataOcorrencia: '15/02/2024', Valor: '2.300,00', TipoAnotacaoDescricao: 'Título Vencido' }
    ]
  },
  Protestos: {
    TotalOcorrencias: 1,
    ProtestosDetalhe: [
      { DataOcorrencia: '20/02/2024', Valor: '5.000,00', Cidade: 'São Paulo', Estado: 'SP' }
    ]
  },
  AcoesJudiciais: {
    TotalOcorrencias: 0,
    Mensagem: 'Nenhuma ação judicial encontrada'
  },
  ParticipacoesFalencias: {
    TotalOcorrencias: 0,
    Mensagem: 'Nenhuma participação em falência encontrada'
  },
  SociosAdministradores: [
    { Nome: 'Maria Silva', CPF: '123.456.789-00', Participacao: '60%' },
    { Nome: 'João Santos', CPF: '987.654.321-00', Participacao: '40%' }
  ]
};

const BusinessAnalysis = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedDetailCard, setSelectedDetailCard] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [monthlyBilling, setMonthlyBilling] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [isExpandedDetails, setIsExpandedDetails] = useState(false);
  const [companyCodeFilter, setCompanyCodeFilter] = useState('');
  const [creditLimit, setCreditLimit] = React.useState('');
  const [prepaidLimit, setPrepaidLimit] = React.useState('');
  const [comments, setComments] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [creditLimitsId, setCreditLimitsId] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [customerDetails, setCustomerDetails] = React.useState(null);
  const [userCompanyId, setUserCompanyId] = React.useState(null);
  const [loadingCalculatedLimit, setLoadingCalculatedLimit] = useState(false);
  
  // Format currency input
  const formatCurrency = (value) => {
    const num = Number(value.replace(/[^\d]/g, '')) / 100;
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Parse currency input
  const parseCurrency = (formatted) => {
    return formatted.replace(/[^\d]/g, '');
  };

  // Função para carregar os limites de crédito do cliente
  const loadCustomerCreditLimits = async (customerId) => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      // Buscar o cliente para obter o credit_limits_id
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('credit_limits_id')
        .eq('id', customerId)
        .single();
      
      if (customerError) throw customerError;
      
      // Se o cliente tiver um credit_limits_id, buscar os limites
      if (customerData?.credit_limits_id) {
        const { data: creditLimitData, error: creditLimitError } = await supabase
          .from('credit_limit_amount')
          .select('*')
          .eq('id', customerData.credit_limits_id)
          .single();
          
        if (creditLimitError) throw creditLimitError;
        
        if (creditLimitData) {
          // Atualizar os estados
          setCreditLimitsId(creditLimitData.id);
          
          // Formatar os valores de moeda
          if (creditLimitData.credit_limit) {
            const formattedCreditLimit = (creditLimitData.credit_limit).toLocaleString('pt-BR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            });
            setCreditLimit(formattedCreditLimit);
          }
          
          if (creditLimitData.prepaid_limit) {
            const formattedPrepaidLimit = (creditLimitData.prepaid_limit).toLocaleString('pt-BR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            });
            setPrepaidLimit(formattedPrepaidLimit);
          }
          
          setComments(creditLimitData.comments || '');
        }
      } else {
        // Se não tiver limites cadastrados, limpar os campos
        setCreditLimitsId(null);
        setCreditLimit('');
        setPrepaidLimit('');
        setComments('');
      }
    } catch (error) {
      console.error('Error loading customer credit limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    // Validate if we have a selected customer
    if (!selectedCustomer && !selectedDetailCard?.customer_id) {
      toast.error('Nenhum cliente selecionado');
      return;
    }

    const creditLimitValue = parseCurrency(creditLimit);
    const prepaidLimitValue = parseCurrency(prepaidLimit);
    
    if (!creditLimitValue && !prepaidLimitValue) {
      toast.error('Informe pelo menos um dos limites');
      return;
    }

    setSaving(true);
    
    try {
      // Obter o ID do cliente de várias maneiras possíveis para garantir que temos o ID correto
      const customerId = selectedDetailCard?.customer_id || 
                         selectedDetailCard?.customer?.id || 
                         selectedCustomer;
      
      if (!customerId) {
        throw new Error('ID do cliente não encontrado');
      }

      // Verifica se estamos atualizando ou criando um novo registro
      if (creditLimitsId) {
        // Atualizar o registro existente
        const { error: updateError } = await supabase
          .from('credit_limit_amount')
          .update({
            credit_limit: creditLimitValue ? Number(creditLimitValue) / 100 : null,
            prepaid_limit: prepaidLimitValue ? Number(prepaidLimitValue) / 100 : null,
            comments: comments || null
          })
          .eq('id', creditLimitsId);
          
        if (updateError) throw updateError;
        
        toast.success('Análise financeira atualizada com sucesso!');
      } else {
        // Criar um novo registro
        const { data: creditLimitData, error: creditLimitError } = await supabase
          .from('credit_limit_amount')
          .insert([{
            credit_limit: creditLimitValue ? Number(creditLimitValue) / 100 : null,
            prepaid_limit: prepaidLimitValue ? Number(prepaidLimitValue) / 100 : null,
            comments: comments || null
          }])
          .select('id')
          .single();

        if (creditLimitError) throw creditLimitError;
        
        if (!creditLimitData?.id) {
          throw new Error('Erro ao criar registro de limite de crédito');
        }
        
        // Atualizar o cliente com o credit_limits_id
        const { error: customerUpdateError } = await supabase
          .from('customer')
          .update({ credit_limits_id: creditLimitData.id })
          .eq('id', customerId);
          
        if (customerUpdateError) throw customerUpdateError;
        
        // Atualizar o id do limite de crédito no estado
        setCreditLimitsId(creditLimitData.id);
        
        toast.success('Análise financeira salva com sucesso!');
      }
    } catch (error) {
      console.error('Error saving credit limit:', error);
      toast.error(`Erro ao salvar análise financeira: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  

  const handleStepClick = (step, type) => {
    setSelectedStep(step);
    if (type === 'approve') {
      setShowApprovalModal(true);
    }
  };

  useEffect(() => {
    async function loadCustomers() {
      try {
        // Obter a sessão atual do usuário
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          console.error('Usuário não autenticado');
          return;
        }
        
        // Buscar o perfil do usuário para obter a company_id associada
        const { data: userProfileData, error: userProfileError } = await supabase
          .from('user_profile')
          .select('company_id')
          .eq('logged_id', session.user.id)
          .single();
          
        if (userProfileError || !userProfileData?.company_id) {
          console.error('Erro ao buscar perfil do usuário ou company_id não encontrado:', userProfileError);
          return;
        }
        
        const userCompanyId = userProfileData.company_id;
        setUserCompanyId(userCompanyId); // Salva o company_id para uso em outras funções
        
        // Buscar o corporate_group_id da company do usuário
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', userCompanyId)
          .single();

        if (companyError || !companyData?.corporate_group_id) {
          console.error('Erro ao buscar corporate_group_id:', companyError);
          return;
        }

        // Buscar todas as companies desse corporate_group
        const { data: companiesData, error: companiesError } = await supabase
          .from('company')
          .select('id')
          .eq('corporate_group_id', companyData.corporate_group_id);

        if (companiesError || !companiesData?.length) {
          console.error('Erro ao buscar companies do corporate group:', companiesError);
          return;
        }
          
        const companyIds = companiesData.map(c => c.id);
        
        // Buscar todos os clientes associados a essas companies
        const { data: customersData, error: customersError } = await supabase
          .from('customer')
          .select('id, name, company_code')
          .in('company_id', companyIds)
          .order('name');

        if (customersError) {
          console.error('Erro ao buscar customers:', customersError);
          return;
        }
        
        setCustomers(customersData || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadSalesOrders() {
      try {
        const { data: companyData } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', DEFAULT_COMPANY_ID)
          .single();

        if (companyData?.corporate_group_id) {
          const { data: companiesData } = await supabase
            .from('company')
            .select('id')
            .eq('corporate_group_id', companyData.corporate_group_id);

          if (companiesData?.length > 0) {
            const companyIds = companiesData.map(c => c.id);
            
            let query = supabase
              .from('sale_orders')
              .select(`
                id,
                created_at,
                customer_id,
                customer:customer_id(id, name),
                total_qtt,
                total_amt, 
                due_date
              `)
              .in('company_id', companyIds)
              .order('created_at', { ascending: false });
              
            if (selectedCustomer) {
              query = query.eq('customer_id', selectedCustomer);
            }
            
            const { data: ordersData, error } = await query;

            if (error) throw error;
            setSalesOrders(ordersData || []);
          }
        }
      } catch (error) {
        console.error('Error loading sales orders:', error);
      }
    }

    loadSalesOrders();
  }, [selectedCustomer]);

  useEffect(() => {
    async function loadMonthlyBilling() {
      try {
        // Definir o período de 13 meses
        const startDate = new Date(2024, 2, 1); // Mar 2024
        const endDate = new Date(2025, 3, 30); // Apr 2025

        const { data: companyData } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', DEFAULT_COMPANY_ID)
          .single()

        if (companyData?.corporate_group_id) {
          let query = supabase
            .from('vw_faturamento_mensal')
            .select('*')
            .eq('corporate_group_id', companyData.corporate_group_id);
            
          if (selectedCustomer) {
            query = query.eq('customer_id', selectedCustomer);
          }
          
          const { data: billingData, error } = await query;

          if (error) {
            console.error('Error fetching billing data:', error);
            return;
          }

          // Criar array com todos os meses do período
          const allMonths = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            allMonths.push(format(currentDate, 'yyyy-MM'));
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          // Filter and group data by month
          const groupedData = {};
          
          // Inicializar todos os meses com zero
          allMonths.forEach(month => {
            groupedData[month] = {
              month,
              total_faturado: 0
            };
          });

          // Preencher com dados reais onde existirem
          billingData?.forEach(item => {
            const monthKey = format(new Date(item.month), 'yyyy-MM');
            if (groupedData[monthKey]) {
              groupedData[monthKey].total_faturado += parseFloat(item.total_faturado) || 0;
            }
          });

          // Convert grouped data to array and sort by month
          const processedData = Object.values(groupedData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(item => ({
              month: format(new Date(item.month + '-01'), 'MMM'),
              value: item.total_faturado
            }));

          setMonthlyBilling(processedData);
        }
      } catch (error) {
        console.error('Error loading monthly billing:', error);
        setMonthlyBilling([]);
      }
    }

    loadMonthlyBilling();
  }, [selectedCustomer]);

  useEffect(() => {
    // Recuperar os dados da solicitação selecionada do localStorage
    const selectedRequest = JSON.parse(localStorage.getItem('selectedRequest'));
    if (selectedRequest) {
      setSelectedCustomer(selectedRequest.customer_id);
      setCompanyName(selectedRequest.company_name);
    }
  }, []);

  useEffect(() => {
    // Carregar os limites de crédito do cliente sempre que o cliente selecionado mudar
    if (selectedCustomer) {
      loadCustomerCreditLimits(selectedCustomer);
    }
  }, [selectedCustomer]);

  // Função para fazer upload de arquivos
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar se temos customerId e userCompanyId
    const customerId = selectedCustomer;
    
    if (!customerId) {
      alert('Selecione um cliente primeiro!');
      return;
    }
    
    // Buscar informações sobre a company do usuário logado
    try {
      setUploading(true);
      
      // 1. Obter a sessão atual do usuário
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        throw new Error('Usuário não autenticado');
      }
      
      // 2. Buscar o perfil do usuário para obter a company_id
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profile')
        .select('company_id')
        .eq('logged_id', session.user.id)
        .single();
        
      if (userProfileError || !userProfileData?.company_id) {
        throw new Error('Não foi possível obter a company_id do usuário');
      }
      
      const userCompanyId = userProfileData.company_id;
      
      // Usando diretamente o ID do cliente ao invés do nome
      const customerIdString = customerId.toString();
      
      // 4. Verificar se a pasta da company já existe
      const { data: companyFolderExists } = await supabase
        .storage
        .from('financial-analysis')
        .list(userCompanyId.toString());
      
      // Define o caminho base usando o ID da empresa e o ID do cliente
      const basePath = `${userCompanyId}/${customerIdString}`;
      
      // Array para armazenar os arquivos carregados
      const uploadedFilesList = [];
      
      // 5. Fazer upload de cada arquivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${basePath}/${Date.now()}_${file.name}`;
        
        // Upload do arquivo
        const { data, error } = await supabase.storage
          .from('financial-analysis')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error);
        } else {
          // Obter a URL pública do arquivo
          const { data: { publicUrl } } = supabase.storage
            .from('financial-analysis')
            .getPublicUrl(filePath);
            
          uploadedFilesList.push({
            name: file.name,
            path: filePath,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }
      
      // Atualizar a lista de arquivos carregados
      setUploadedFiles(prev => [...prev, ...uploadedFilesList]);
      
      // Limpar o input de arquivo
      e.target.value = null;
      
      alert(`${files.length} arquivo(s) carregado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer upload de arquivos:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Função para excluir um arquivo
  const handleDeleteFile = async (fileIndex) => {
    try {
      const fileToDelete = uploadedFiles[fileIndex];
      
      if (!fileToDelete || !fileToDelete.path) {
        throw new Error('Arquivo não encontrado');
      }
      
      // Excluir o arquivo do storage
      const { error } = await supabase.storage
        .from('financial-analysis')
        .remove([fileToDelete.path]);
        
      if (error) {
        throw error;
      }
      
      // Remover o arquivo da lista
      const updatedFiles = [...uploadedFiles];
      updatedFiles.splice(fileIndex, 1);
      setUploadedFiles(updatedFiles);
      
      alert('Arquivo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert(`Erro ao excluir arquivo: ${error.message}`);
    }
  };

  // Add this new function to load the calculated limit
  const handleLoadCalculatedLimit = async () => {
    if (!selectedCustomer) return;
    
    setLoadingCalculatedLimit(true);
    try {
      // First get the customer's credit_limits_id
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('credit_limits_id')
        .eq('id', selectedCustomer)
        .single();
      
      if (customerError) throw customerError;
      
      if (customerData?.credit_limits_id) {
        // Then get the calculated limit
        const { data: creditLimitData, error: creditLimitError } = await supabase
          .from('credit_limit_amount')
          .select('credit_limit_calc')
          .eq('id', customerData.credit_limits_id)
          .single();
          
        if (creditLimitError) throw creditLimitError;
        
        if (creditLimitData?.credit_limit_calc) {
          // Format and set the calculated limit
          const formattedLimit = creditLimitData.credit_limit_calc.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          setCreditLimit(formattedLimit);
        }
      }
    } catch (error) {
      console.error('Error loading calculated limit:', error);
      alert('Erro ao carregar limite calculado');
    } finally {
      setLoadingCalculatedLimit(false);
    }
  };

  return (
    <>
      <Header>
        <div className="title-row font-semibol text-2xl">
          <h2>Análise de Risco</h2>
        </div>
        {companyName && (
          <div className="company-name">{companyName}</div>
        )}
      </Header>

      <div>
        <SearchBar style={{ background: 'white' }}>
          <div className="filter-toggle" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ display: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FunnelSimple size={20} />
              <span>Filtros</span>
            </div>
            <CaretDown 
              size={16} 
              style={{ 
                transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0)', 
                transition: 'transform 0.3s ease' 
              }} 
            />
          </div>

          <div className="filter-content" style={{ display: window.innerWidth > 768 || isFilterOpen ? 'block' : 'none', background: 'white' }}>
            {!companyName && (
              <div>
                <label>Cliente</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: 12 }}>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    style={{ width: '200px', height: 32 }}
                  >
                    <option value="">Todos</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company_code ? `${customer.company_code} - ${customer.name}` : customer.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={companyCodeFilter || ''}
                    onChange={e => setCompanyCodeFilter(e.target.value)}
                    placeholder="Código Cliente SAP"
                    style={{ width: '200px', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: 4, height: 32 }}
                  />
                  <button style={{ marginTop: 2.5, border: '0px', color: 'white', background: '#0066FF'}} onClick={() => { setSelectedCustomer(''); setCompanyCodeFilter(''); }}>
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </SearchBar>
        {!selectedCustomer && (
          <div className="card" style={{ background: 'white', padding: 24, borderRadius: 8, marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>Visão Geral da Carteira</h3>
          </div>
        )}

        {/* Bloco de informações da empresa/cliente */}
        {selectedCustomer && (
          <div className="customer-details" style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            maxWidth: '100%'
          }}>
            <div className="header" style={{
              marginBottom: 24,
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 0 }}>Clínica Estética Bella Vita</h2>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setIsExpandedDetails(prev => !prev)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: isExpandedDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <path d="M5 8L10 13L15 8" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            {isExpandedDetails && (
              <>
                <div style={{ fontSize: 14, color: '#6B7280', marginTop: 0, marginBottom: 0 }}>Bella Vita Serviços Médicos e Estéticos Ltda</div>
                <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Cód. 12345</div>
                <a href="https://bellavita.com.br" target="_blank" rel="noopener noreferrer" className="website" style={{ fontSize: 14, color: '#2563EB', marginTop: 4, display: 'inline-block' }}>
                  bellavita.com.br
                </a>
                <div className="content" style={{ display: 'flex', gap: 48, marginTop: 24 }}>
                  <div className="company-info" style={{ display: 'flex', gap: 48, flex: 1 }}>
                    <div className="info-field" style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase' }}>CNPJ</label>
                      <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>12.345.678/0001-90</p>
                    </div>
                    <div className="info-field" style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase' }}>Endereço</label>
                      <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>Av. Paulista, 1000 - Bela Vista</p>
                      <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>São Paulo - SP, 01310-100</p>
                    </div>
                  </div>
                  <div className="contacts-section" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <div className="contacts-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, margin: -4, padding: 4 }}>
                      {[
                        { name: 'Maria Silva', phone: '(11) 98765-4321', email: 'maria.silva@bellavita.com.br' },
                        { name: 'João Santos', phone: '(11) 98765-4322', email: 'joao.santos@bellavita.com.br' },
                        { name: 'Ana Oliveira', phone: '(11) 98765-4323', email: 'ana.oliveira@bellavita.com.br' }
                      ].map((contact, index) => (
                        <div className="contact-card" key={index} style={{ minWidth: 260, background: '#F9FAFB', padding: 16, borderRadius: 6 }}>
                          <div className="name" style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 12 }}>{contact.name}</div>
                          <div className="contact-info" style={{ fontSize: 14, color: '#6B7280' }}>
                            <p style={{ marginBottom: 4 }}>{contact.phone}</p>
                            <p style={{ marginBottom: 0 }}><a href={`mailto:${contact.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{contact.email}</a></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <DashboardGrid>
        <div className="card">
          <h3>Ordens de venda a crédito</h3>
          <CardValue>
            73% <span style={{ color: 'var(--success)' }}>+5%</span>
          </CardValue>
          <CardSubtitle>Taxa de conversão Ordem de venda</CardSubtitle>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={stackedBarData} margin={{ top: 20, right: 0, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Taxa de Aprovação') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="left" 
                height={36}
                content={({ payload }) => (
                  <ul style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    fontSize: '12px',
                    color: 'var(--secondary-text)', 
                    margin: 0, 
                    padding: 0 
                  }}>
                    {payload.map((entry, index) => (
                      <li key={`item-${index}`} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: 10, 
                          height: 10, 
                          backgroundColor: entry.color, 
                          borderRadius: '2px' 
                        }} />
                        {entry.value}
                      </li>
                    ))}
                  </ul>
                )}
              />
              <Bar dataKey="pedidos" fill="#76D9DF" name="Pedidos" barSize={20} yAxisId="left" />
              <Line 
                type="monotone" 
                dataKey="taxaAprovacao" 
                stroke="#3EB655"
                strokeWidth={2} 
                dot={{ r: 3 }} 
                name="Taxa de Aprovação" 
                yAxisId="right" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Faturamento</h3>
          <CardValue>
            187,65mi <span style={{ color: 'var(--error)' }}>-5%</span>
          </CardValue>
          <CardSubtitle>Faturamento</CardSubtitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyBilling.slice(-13)} margin={{ top: 20, right: 0, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${(value/1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`}
              />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="var(--primary-blue)"
                name="Valor Total"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Resumo Risco Cliente</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            height: '260px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>R$ 500.000,00</div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>Limite de crédito concedido</h4>  
            </div>
            
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>65%</div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>Limite de crédito utilizado</h4>
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>R$ 175.000,00</div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>Limite disponível</h4>
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>45 dias</div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>Prazo médio de pagamento</h4>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                Status
              </h4>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-start',
                fontSize: '18px', 
                fontWeight: '600', 
                gap: '2px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'var(--error)', 
                    display: 'inline-block' 
                  }} />
                  Em atraso
                </div>
                
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--error)', 
                  fontWeight: 'normal', 
                  paddingLeft: '14px'
                }}>
                  (15 dias)
                </span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>Máx. dias em atraso</h4>
              <h4 style={{ fontSize: '10px', color: 'var(--secondary-text)', marginBottom: '2px' }}>(12 meses)</h4>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>32 dias</div>
            </div>
          </div>
        </div>
      </DashboardGrid>

        {selectedCustomer && (
          <>
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{marginBottom: '30px'}}>Serasa Concentre PJ</h3>
          <DetailView>
            <div className="detail-grid">
              <div className="detail-section">
                <h4>Síntese Cadastral</h4>
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Documento</div>
                    <div style={{ fontSize: '14px' }}>{mockDetailData.SinteseCadastral.Documento}</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Nome</div>
                    <div style={{ fontSize: '14px' }}>{mockDetailData.SinteseCadastral.Nome}</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Data Fundação</div>
                    <div style={{ fontSize: '14px' }}>{mockDetailData.SinteseCadastral.DataFundacao}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Situação RFB</div>
                    <div style={{ fontSize: '14px' }}>{mockDetailData.SinteseCadastral.SituacaoRFB}</div>
                  </div>
                </div>
              </div>

              <div className="detail-section score-section">
                <h4>Score Serasa</h4>
                <div className="score-value">{mockDetailData.SerasaScoreEmpresas.Score}</div>
                <div className="score-label">{mockDetailData.SerasaScoreEmpresas.Classificacao}</div>
              </div>

              <div className="detail-section">
                <h4>
                  Pendências Financeiras
                  
                  <span className="occurrence-count">{mockDetailData.PendenciasFinanceiras.TotalOcorrencias}</span>
                </h4>
                {mockDetailData.PendenciasFinanceiras.PendenciasFinanceirasDetalhe.map((item, index) => (
                  <div key={index} className="occurrence-item">
                    <div className="date">{item.DataOcorrencia}</div>
                    <div className="value">R$ {item.Valor}</div>
                    <div className="details">{item.TipoAnotacaoDescricao}</div>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h4>
                  Protestos
                  <span className="occurrence-count">{mockDetailData.Protestos.TotalOcorrencias}</span>
                </h4>
                {mockDetailData.Protestos.ProtestosDetalhe.map((item, index) => (
                  <div key={index} className="occurrence-item">
                    <div className="date">{item.DataOcorrencia}</div>
                    <div className="value">R$ {item.Valor}</div>
                    <div className="details">{item.Cidade} - {item.Estado}</div>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h4>
                  Ações Judiciais
                  <span className="occurrence-count">{mockDetailData.AcoesJudiciais.TotalOcorrencias}</span>
                </h4>
                <div className="no-occurrences">{mockDetailData.AcoesJudiciais.Mensagem}</div>
              </div>

              <div className="detail-section">
                <h4>
                  Participações em Falências
                  <span className="occurrence-count">{mockDetailData.ParticipacoesFalencias.TotalOcorrencias}</span>
                </h4>
                <div className="no-occurrences">{mockDetailData.ParticipacoesFalencias.Mensagem}</div>
              </div>

              <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
                <h4>Sócios e Administradores</h4>
                {mockDetailData.SociosAdministradores.map((socio, index) => (
                  <div key={index} className="occurrence-item">
                    <div className="value">{socio.Nome}</div>
                    <div className="details">
                      CPF: {socio.CPF} • Participação: {socio.Participacao}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DetailView>
          </div>
            <HistoryAnalysisContainer>
            <CustomerHistory>
              {/* Histórico do cliente */}
              <h4 style={{ marginBottom: '16px', color: 'black', fontWeight: '500'}}>Histórico do cliente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Timeline item 1 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(62, 182, 85, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#3EB655',
                    }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Liquidação de parcela</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>18/06/2024 às 09:37</div>
                    </div>
                    <div style={{ 
                      backgroundColor: 'var(--background)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      fontSize: '13px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div>N° da Parcela:</div>
                        <div style={{ fontWeight: '500' }}>4</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>Valor:</div>
                        <div style={{ fontWeight: '500' }}>R$ 1.000,00</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline item 2 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4F46E5',
                    }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Alteração de Domicílio</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>18/06/2024 às 09:37</div>
                    </div>
                    <div style={{ 
                      backgroundColor: 'var(--background)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      fontSize: '13px' 
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>Dados Bancários Anteriores:</div>
                        <div>117 - Corretora de Câmbio Ltda</div>
                        <div>Agência: 0001-0 | Conta: 123456-6</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>Dados Bancários Novos:</div>
                        <div>127 - Corretora de Câmbio 2 Ltda</div>
                        <div>Agência: 0002-0 | Conta: 123456-6</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline item 3 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(234, 88, 12, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#EA580C',
                    }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Alteração de NF-e</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>18/06/2024 às 09:37</div>
                    </div>
                    <div style={{ 
                      backgroundColor: 'var(--background)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      fontSize: '13px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>Alteração:</div>
                        <div style={{ fontWeight: '500' }}>Mercadoria</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline item 4 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#0284C7',
                    }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Recebimento de Mercadoria</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>18/06/2024 às 09:37</div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline item 5 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(225, 29, 72, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#E11D48',
                    }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Cancelamento de NF-e</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>18/06/2024 às 09:37</div>
                    </div>
                  </div>
                </div>
              </div>
            </CustomerHistory>
            <FinancialAnalysisContainer>
              <h4>Análise Financeira</h4>
              
              <button 
                className="load-calculated-limit"
                onClick={handleLoadCalculatedLimit}
                disabled={loadingCalculatedLimit || !selectedCustomer}
              >
                {loadingCalculatedLimit ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Carregando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Carregar limite calculado
                  </>
                )}
              </button>
              
              <div className="form-group">
                <label htmlFor="creditLimit">Limite de Crédito a Conceder</label>
                <div className="prefix">
                  <input 
                    type="text" 
                    id="creditLimit"
                    placeholder="0,00"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(formatCurrency(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="prepaidLimit">Limite Pré-Pago</label>
                <div className="prefix">
                  <input 
                    type="text" 
                    id="prepaidLimit"
                    placeholder="0,00"
                    value={prepaidLimit}
                    onChange={(e) => setPrepaidLimit(formatCurrency(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="analysisComments">Comentários e Análise</label>
                <textarea 
                  id="analysisComments"
                  placeholder="Digite aqui os comentários e análise financeira para esta solicitação..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
                
                <div className="file-upload">
                  <label className="upload-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Anexar arquivo
                    <input type="file" multiple onChange={handleFileUpload} />
                  </label>
                  
                  <div className="file-list">
                    {uploadedFiles.map((file, index) => (
                      <div className="file-item" key={index}>
                        <div className="file-name">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          {file.name}
                        </div>
                        <div className="file-actions">
                          <button title="Baixar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </button>
                          <button title="Excluir" className="delete" onClick={() => handleDeleteFile(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="button-group">
                <button className="secondary">Cancelar</button>
                <button 
                  className="primary"
                  onClick={handleSaveAnalysis}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </FinancialAnalysisContainer>
            </HistoryAnalysisContainer>

            {/* Listagem de Pedidos do Cliente */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Pedidos do Cliente</h3>
              <OrdersTable 
                orders={salesOrders}
              />
            </div>
          </>
        )}
        
    </>
  );
};


export default BusinessAnalysis