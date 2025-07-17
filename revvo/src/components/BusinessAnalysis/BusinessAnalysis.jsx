import React, { useState, useEffect } from 'react';
import { FunnelSimple, CaretDown } from '@phosphor-icons/react';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { BillingService, CustomerService, ScoreService, RiskSummaryService } from '../../services';
import OrdersTable from '../OrdersTable';
import { CustomerTable, mockCustomers } from './CustomerTable';
import { CustomerDetails } from './CustomerDetails';

const Header = styled.header`
  margin-bottom: 24px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 8px;
  margin: 24px 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .filter-content {
    padding: 24px;
    background: white;

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
    height: 350px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      flex-shrink: 0;
    }
    
    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }
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

const DetailView = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  border-radius: 8px;
  padding: 24px;
  flex: 1;
  position: relative;
  min-height: 400px;

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

const HistoryAnalysisContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const CustomerHistory = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  height: 100%;
  overflow-y: auto;
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
      justify-content: center;

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
// MOCK DATA PARA O SERASA
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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [monthlyBilling, setMonthlyBilling] = useState([]);
  const [paymentTermScoreData, setPaymentTermScoreData] = useState([]);
  const [billingMetrics, setBillingMetrics] = useState({
    currentAverage: 0,
    variationPercentage: 0
  });
  const [scoreMetrics, setScoreMetrics] = useState({
    currentScore: 850,
    scoreVariation: 13
  });
  const [companyName, setCompanyName] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [customerAddress, setCustomerAddress] = useState('');
  const [isExpandedDetails, setIsExpandedDetails] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [prepaidLimit, setPrepaidLimit] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [creditLimitsId, setCreditLimitsId] = useState(null);  
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userCompanyId, setUserCompanyId] = useState(null);
  const [corporateGroupId, setCorporateGroupId] = useState(null);
  const [loadingCalculatedLimit, setLoadingCalculatedLimit] = useState(false);
  
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loadingWorkflowHistory, setLoadingWorkflowHistory] = useState(false);
  const [expandedWorkflows, setExpandedWorkflows] = useState(new Set());
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(null);
  
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [riskSummaryData, setRiskSummaryData] = useState({
    creditLimitGranted: 500000.00,
    creditLimitUsed: 65,
    amountToReceive: 175000.00,
    avgPaymentTerm: 45,
    isOverdue: true,
    overdueAmount: 97000.00,
    avgDelayDays: 15,
    maxDelayDays12Months: 32
  });
  
  const formatCurrency = (value) => {
    const num = Number(value.replace(/[^\d]/g, '')) / 100;
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrency = (formatted) => {
    return formatted.replace(/[^\d]/g, '');
  };

  const formatVariationDisplay = (variation, isScore = false) => {
    const isPositive = variation >= 0;
    const color = isPositive ? 'var(--success)' : 'var(--error)';
    const sign = isPositive ? '+' : '';
    const suffix = isScore ? ' pts' : '%';
    
    return (
      <span style={{ color }}>
        {sign}{isScore ? variation : variation.toFixed(1)}{suffix}
      </span>
    );
  };

  const loadCustomerCreditLimits = async (customerId) => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const creditData = await CustomerService.getCustomerCreditLimits(customerId);
      
      if (creditData) {
        setCreditLimitsId(creditData.creditLimitsId);
        setCreditLimit(creditData.creditLimit);
        setPrepaidLimit(creditData.prepaidLimit);
        setComments(creditData.comments);
      } else {
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
    if (!selectedCustomer) {
      alert('Nenhum cliente selecionado');
      return;
    }

    const creditLimitValue = parseCurrency(creditLimit);
    const prepaidLimitValue = parseCurrency(prepaidLimit);
    
    if (!creditLimitValue && !prepaidLimitValue) {
      alert('Informe pelo menos um dos limites');
      return;
    }

    setSaving(true);
    
    try {
      const limitData = {
        credit_limit: creditLimitValue ? Number(creditLimitValue) / 100 : null,
        prepaid_limit: prepaidLimitValue ? Number(prepaidLimitValue) / 100 : null,
        comments: comments || null
      };

      await CustomerService.updateCustomerCreditLimits(selectedCustomer, limitData);
      alert('Análise financeira salva com sucesso!');
    } catch (error) {
      console.error('Error saving credit limit:', error);
      alert(`Erro ao salvar análise financeira: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const fetchWorkflowHistory = async (customerId) => {
    if (!customerId) return;
    setLoadingWorkflowHistory(true);
    try {
      const { data: creditRequests, error: requestsError } = await supabase
        .from('credit_limit_request')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (creditRequests?.length > 0) {
        const workflowHistoryData = [];

        for (const request of creditRequests) {
          const { data: workflowOrder, error: workflowOrderError } = await supabase
            .from('workflow_sale_order')
            .select('*')
            .eq('credit_limit_req_id', request.id)
            .single();

          if (workflowOrderError || !workflowOrder) continue;

          const { data: workflowDetails, error: workflowDetailsError } = await supabase
            .from('workflow_details')
            .select(`
              *,
              jurisdiction:user_role (
                name,
                description
              )
            `)
            .eq('workflow_sale_order_id', workflowOrder.id)
            .order('workflow_step', { ascending: true });

          if (workflowDetailsError) continue;

          let detailsWithApprover = workflowDetails;
          const approverIds = workflowDetails
            .map(d => d.approver)
            .filter(id => !!id);
          let approverMap = {};
          if (approverIds.length > 0) {
            const { data: approversData } = await supabase
              .from('user_profile')
              .select('logged_id, name')
              .in('logged_id', approverIds);
            if (approversData) {
              approverMap = approversData.reduce((acc, cur) => {
                acc[cur.logged_id] = cur.name;
                return acc;
              }, {});
            }
          }
          detailsWithApprover = workflowDetails.map(d => ({
            ...d,
            approver_name: d.approver ? approverMap[d.approver] || d.approver : null
          }));

          workflowHistoryData.push({
            id: workflowOrder.id,
            creditRequest: request,
            workflowOrder: workflowOrder,
            details: detailsWithApprover || [],
            created_at: request.created_at,
            computedStatus: detailsWithApprover?.every(d => d.approval === true) ? 'approved' :
                           detailsWithApprover?.some(d => d.approval === false) ? 'rejected' : 'pending'
          });
        }

        setWorkflowHistory(workflowHistoryData);
      } else {
        setWorkflowHistory([]);
      }
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      setWorkflowHistory([]);
    } finally {
      setLoadingWorkflowHistory(false);
    }
  };

  const toggleWorkflowExpansion = (workflowId) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const handleWorkflowStepClick = (step) => {
    setSelectedWorkflowStep(step);
    setShowWorkflowModal(true);
  };

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error('User not authenticated');
        return;
      }
      
      const { data: userProfile } = await supabase
        .from('user_profile')
        .select('company_id')
        .eq('logged_id', session.user.id)
        .single();
        
      if (!userProfile?.company_id) {
        console.error('Company ID not found');
        return;
      }
      
      setUserCompanyId(userProfile.company_id);
      
      const { data: companyData } = await supabase
        .from('company')
        .select('corporate_group_id')
        .eq('id', userProfile.company_id)
        .single();

      if (companyData?.corporate_group_id) {
        setCorporateGroupId(companyData.corporate_group_id);
      }
      
      const customersData = await CustomerService.getCustomersByCompanyGroup(userProfile.company_id);
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSalesOrders = async () => {
    if (!corporateGroupId) return;
    
    try {
      const { data: companiesData } = await supabase
        .from('company')
        .select('id')
        .eq('corporate_group_id', corporateGroupId);

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
    } catch (error) {
      console.error('Error loading sales orders:', error);
    }
  };

  const loadMonthlyBilling = async () => {
    if (!corporateGroupId) return;
    
    setLoading(true);
    try {
      const billingData = await BillingService.getMonthlyBillingData(selectedCustomer, corporateGroupId);
      
      const billingWithOccupation = await BillingService.getCreditLimitOccupation(selectedCustomer, billingData);
      
      setMonthlyBilling(billingWithOccupation);
      
      const metrics = BillingService.calculateBillingMetrics(billingData);
      setBillingMetrics(metrics);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setMonthlyBilling([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRiskSummaryData = async () => {
    if (!selectedCustomer || !corporateGroupId) {
      console.log('Missing customer or corporate group ID, using mock data');
      return;
    }
    
    try {
      console.log('Loading risk summary data for customer:', selectedCustomer);
      setLoading(true); // Adicione um estado de loading se necessário
      
      const riskData = await RiskSummaryService.getRiskSummaryData(selectedCustomer, corporateGroupId);
      
      console.log('Risk data loaded:', riskData);
      setRiskSummaryData(riskData);
      
      // Verificar se os dados estão sendo preenchidos corretamente
      if (riskData.creditLimitGranted === 0 && riskData.amountToReceive === 0) {
        console.warn('Risk data appears to be empty, check data sources');
      }
      
    } catch (error) {
      console.error('Error loading risk summary data:', error);
      // Em caso de erro, manter os dados mock para não quebrar a interface
      setRiskSummaryData(RiskSummaryService.getMockRiskData());
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentTermAndScore = async () => {
    setLoadingScore(true);
    try {
      const scoreData = await ScoreService.getPaymentTermAndScore(selectedCustomer, corporateGroupId);
      setPaymentTermScoreData(scoreData);
      
      const metrics = ScoreService.calculateScoreMetrics(scoreData);
      setScoreMetrics(metrics);
    } catch (error) {
      console.error('Error loading payment term and score data:', error);
      setPaymentTermScoreData([]);
    } finally {
      setLoadingScore(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const customerId = selectedCustomer;
    
    if (!customerId) {
      alert('Selecione um cliente primeiro!');
      return;
    }
    
    try {
      setUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profile')
        .select('company_id')
        .eq('logged_id', session.user.id)
        .single();
        
      if (userProfileError || !userProfileData?.company_id) {
        throw new Error('Não foi possível obter a company_id do usuário');
      }
      
      const userCompanyId = userProfileData.company_id;
      const customerIdString = customerId.toString();
      const basePath = `${userCompanyId}/${customerIdString}`;
      const uploadedFilesList = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${basePath}/${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('financial-analysis')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error);
        } else {
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
      
      setUploadedFiles(prev => [...prev, ...uploadedFilesList]);
      e.target.value = null;
      alert(`${files.length} arquivo(s) carregado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer upload de arquivos:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileIndex) => {
    try {
      const fileToDelete = uploadedFiles[fileIndex];
      
      if (!fileToDelete || !fileToDelete.path) {
        throw new Error('Arquivo não encontrado');
      }
      
      const { error } = await supabase.storage
        .from('financial-analysis')
        .remove([fileToDelete.path]);
        
      if (error) {
        throw error;
      }
      
      const updatedFiles = [...uploadedFiles];
      updatedFiles.splice(fileIndex, 1);
      setUploadedFiles(updatedFiles);
      
      alert('Arquivo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert(`Erro ao excluir arquivo: ${error.message}`);
    }
  };

  const handleLoadCalculatedLimit = async () => {
    if (!selectedCustomer) return;
    
    setLoadingCalculatedLimit(true);
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('credit_limits_id')
        .eq('id', selectedCustomer)
        .single();
      
      if (customerError) throw customerError;
      
      if (customerData?.credit_limits_id) {
        const { data: creditLimitData, error: creditLimitError } = await supabase
          .from('credit_limit_amount')
          .select('credit_limit_calc')
          .eq('id', customerData.credit_limits_id)
          .single();
          
        if (creditLimitError) throw creditLimitError;
        
        if (creditLimitData?.credit_limit_calc) {
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

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
  // if (corporateGroupId && selectedCustomer) {
    console.log('Loading all customer data for:', selectedCustomer);
    loadSalesOrders();
    loadMonthlyBilling();
    loadPaymentTermAndScore();
    loadRiskSummaryData();
  // }
  }, [selectedCustomer, corporateGroupId]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!selectedCustomer) {
        setCustomerData(null);
        setCustomerAddress('');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('customer')
          .select(`
            id,
            name,
            costumer_email,
            costumer_phone,
            costumer_cnpj,
            costumer_razao_social,
            company_code,
            addr_id
          `)
          .eq('id', selectedCustomer)
          .single();
        if (error) throw error;
        setCustomerData(data);
        // Buscar endereço se addr_id existir
        if (data?.addr_id) {
          const { data: addr, error: addrError } = await supabase
            .from('address')
            .select('*')
            .eq('id', data.addr_id)
            .single();
          if (!addrError && addr) {
            // Montar string do endereço
            const addressString = `${addr.street || ''}${addr.num ? ', ' + addr.num : ''}${addr.compl ? ' - ' + addr.compl : ''}${addr.city ? ' - ' + addr.city : ''}${addr.state ? ' - ' + addr.state : ''}${addr.zcode ? ', ' + addr.zcode : ''}`.trim();
            setCustomerAddress(addressString);
          } else {
            setCustomerAddress('');
          }
        } else {
          setCustomerAddress('');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
        setCustomerData(null);
        setCustomerAddress('');
      }
    };
    fetchCustomerData();
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerCreditLimits(selectedCustomer);
      fetchWorkflowHistory(selectedCustomer);
    } else {
      setWorkflowHistory([]);
    }
  }, [selectedCustomer]);

  return (
    <>
      <Header>
        <div className="title-row font-semibol text-2xl">
          <h2>Análise do Cliente</h2>
        </div>
        {companyName && (
          <div className="company-name">{companyName}</div>
        )}
      </Header>

      <SearchBar>
        <div className="filter-content">
          {!companyName && (
            <div>
              <label>Cliente</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: 12 }}>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  style={{ width: '270px', height: 32 }}
                >
                  <option value="">Todos</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_code ? `${customer.company_code} - ${customer.name}` : customer.name}
                    </option>
                  ))}
                </select>
                <button 
                  style={{ 
                    marginTop: 2.5, 
                    border: '0px', 
                    color: 'white', 
                    background: '#0066FF',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} 
                  onClick={() => setSelectedCustomer('')}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </SearchBar>

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
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 0 }}>{customerData?.name}</h2>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setIsExpandedDetails(prev => !prev)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: isExpandedDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M5 8L10 13L15 8" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {isExpandedDetails && (
            <>
              <div style={{ fontSize: 14, color: '#6B7280', marginTop: 0, marginBottom: 0 }}>Código: {customerData?.company_code}</div>
              <div className="content" style={{ display: 'flex', gap: 48, marginTop: 24 }}>
                <div className="company-info" style={{ display: 'flex', gap: 48, flex: 1 }}>
                  <div className="info-field" style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase' }}>CNPJ</label>
                    <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{customerData?.costumer_cnpj}</p>
                  </div>
                  <div className="info-field" style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase' }}>Endereço</label>
                    <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{customerAddress}</p>
                  </div>
                </div>
                <div className="contacts-section" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <div className="contacts-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, margin: -4, padding: 4 }}>
                    {[
                      { name: customerData?.name, phone: customerData?.costumer_phone, email: customerData?.costumer_email }
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

      <DashboardGrid>
        <div className="card">
          <h3>Prazo médio de Pagamento | Score</h3>
          <div className="card-content">
            <CardValue>
              {scoreMetrics.currentScore} {formatVariationDisplay(scoreMetrics.scoreVariation, true)}
            </CardValue>
            <CardSubtitle>Score atual</CardSubtitle>
            {loadingScore ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Carregando dados...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={paymentTermScoreData} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '12px' }}
                    domain={[300, 900]}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Score') return [`${value} pts`, name];
                      return [`${value} dias`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="left" 
                    height={20}
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
                  <Bar dataKey="paymentTerm" fill="#76D9DF" name="Prazo médio (dias)" barSize={20} yAxisId="left" />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3EB655"
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    name="Score" 
                    yAxisId="right" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Faturamento | Score</h3>
          <div className="card-content">
            <CardValue>
              {BillingService.formatCompactCurrency(billingMetrics.currentAverage)} 
              {formatVariationDisplay(billingMetrics.variationPercentage)}
            </CardValue>
            <CardSubtitle>Faturamento médio dos últimos 3 meses</CardSubtitle>
            {loading ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Carregando dados...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={monthlyBilling} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => BillingService.formatCompactCurrency(value)}
                  />
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
                      if (name === 'Ocupação de Limite') return [`${value.toFixed(1)}%`, name];
                      return [BillingService.formatCurrency(value), name];
                    }}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="left" 
                    height={20}
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
                  <Bar 
                    dataKey="value" 
                    fill="var(--primary-blue)"
                    name="Faturamento"
                    barSize={20}
                    yAxisId="left"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="occupation" 
                    stroke="#3EB655"
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    name="Ocupação de Limite" 
                    yAxisId="right" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Resumo Risco Cliente</h3>
          <div className="card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              height: '240px',
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>
                  {RiskSummaryService.formatCompactCurrency(riskSummaryData.creditLimitGranted)}
                </div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  Limite de crédito concedido
                </h4>  
              </div>
              
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{riskSummaryData.creditLimitUsed}%</div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  Limite de crédito utilizado
                </h4>
              </div>

              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>
                  {RiskSummaryService.formatCompactCurrency(riskSummaryData.amountToReceive)}
                </div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  A receber
                </h4>
              </div>

              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{riskSummaryData.avgPaymentTerm} dias</div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  Prazo médio de pagamento
                </h4>
              </div>

              <div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  {riskSummaryData.isOverdue ? 'Vencido' : 'Em dia'}
                </h4>

                {riskSummaryData.isOverdue ? (
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
                      {RiskSummaryService.formatCompactCurrency(riskSummaryData.overdueAmount)}
                    </div>
                    
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--error)', 
                      fontWeight: 'normal', 
                      paddingLeft: '14px'
                    }}>
                      Atraso médio: {riskSummaryData.avgDelayDays} dias
                    </span>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '18px', 
                    fontWeight: '600'
                  }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: 'var(--success)', 
                      display: 'inline-block' 
                    }} />
                    <span style={{ color: 'var(--success)' }}>Em dia</span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  Máx. dias em atraso
                </h4>
                <h4 style={{ fontSize: '10px', color: 'var(--secondary-text)', marginBottom: '2px' }}>
                  (12 meses)
                </h4>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>
                  {riskSummaryData.maxDelayDays12Months} dias
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardGrid>

      {!selectedCustomer && !selectedCustomerDetails && (
        <CustomerTable 
          customers={mockCustomers} 
          onViewDetails={(customer) => setSelectedCustomerDetails(customer)} 
        />
      )}
      
      {selectedCustomerDetails && (
        <CustomerDetails 
          customer={selectedCustomerDetails} 
          onBack={() => setSelectedCustomerDetails(null)} 
        />
      )}

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
              <h4 style={{ marginBottom: '16px', color: 'black', fontWeight: '500'}}>Histórico de Workflow do cliente</h4>
              
              {loadingWorkflowHistory ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '20px',
                  color: 'var(--secondary-text)'
                }}>
                  Carregando histórico...
                </div>
              ) : workflowHistory.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '20px',
                  color: 'var(--secondary-text)'
                }}>
                  Nenhum histórico de workflow encontrado
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {workflowHistory.map((workflow, index) => {
                    const isExpanded = expandedWorkflows.has(workflow.workflowOrder?.id);
                    const hasDetails = workflow.details && workflow.details.length > 0;
                    
                    const getStatusColor = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'approved':
                        case 'aprovado':
                          return { bg: 'rgba(62, 182, 85, 0.1)', color: '#3EB655' };
                        case 'rejected':
                        case 'rejeitado':
                          return { bg: 'rgba(225, 29, 72, 0.1)', color: '#E11D48' };
                        case 'pending':
                        case 'pendente':
                          return { bg: 'rgba(234, 88, 12, 0.1)', color: '#EA580C' };
                        default:
                          return { bg: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5' };
                      }
                    };

                    const statusColors = getStatusColor(workflow.computedStatus);
                    
                    const translateStatus = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'approved':
                          return 'Aprovado';
                        case 'rejected':
                          return 'Rejeitado';
                        case 'pending':
                          return 'Pendente';
                        default:
                          return 'Em análise';
                      }
                    };
                    
                    const formatDate = (dateString) => {
                      if (!dateString) return 'Data não disponível';
                      try {
                        return new Date(dateString).toLocaleString('pt-BR');
                      } catch {
                        return 'Data inválida';
                      }
                    };

                    return (
                      <div key={workflow.workflowOrder?.id || index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: statusColors.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: statusColors.color,
                          }}></div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>
                              Solicitação de Limite de Crédito
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                              {formatDate(workflow.creditRequest?.created_at)}
                            </div>
                          </div>
                          
                          <div style={{ 
                            backgroundColor: 'var(--background)', 
                            padding: '12px', 
                            borderRadius: '8px',
                            fontSize: '13px' 
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <div>Status:</div>
                              <div style={{ fontWeight: '500', color: statusColors.color }}>
                                {translateStatus(workflow.computedStatus)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <div>Valor Solicitado:</div>
                              <div style={{ fontWeight: '500' }}>
                                {workflow.creditRequest?.credit_limit_amt 
                                  ? `R$ ${parseFloat(workflow.creditRequest.credit_limit_amt).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}`
                                  : 'N/A'
                                }
                              </div>
                            </div>
                            
                            {hasDetails && (
                              <div style={{ marginTop: '8px' }}>
                                <button
                                  onClick={() => toggleWorkflowExpansion(workflow.workflowOrder.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: statusColors.color,
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    padding: '0',
                                    textDecoration: 'underline'
                                  }}
                                >
                                  {isExpanded ? 'Ocultar detalhes' : `Ver detalhes (${workflow.details.length} etapas)`}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {isExpanded && hasDetails && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--secondary-text)' }}>
                                Etapas do Workflow:
                              </div>
                              {workflow.details.map((detail, detailIndex) => {
                                const statusColor =
                                  detail.approval === null ? '#EA580C' :
                                  detail.approval === true ? '#3EB655' : '#E11D48';
                                return (
                                  <div
                                    key={detail.id || detailIndex}
                                    onClick={() => handleWorkflowStepClick(detail)}
                                    style={{
                                      backgroundColor: 'var(--background)',
                                      border: '1px solid rgba(0,0,0,0.1)',
                                      borderRadius: '6px',
                                      padding: '12px 16px',
                                      marginBottom: '4px',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--background)'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ fontWeight: '500' }}>{detail.jurisdiction_name || detail.jurisdiction?.name || `Etapa ${detailIndex + 1}`}</div>
                                      <div style={{ color: statusColor, fontWeight: 500 }}>
                                        {detail.approval === null ? 'Pendente' : detail.approval === true ? 'Aprovado' : 'Rejeitado'}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--secondary-text)' }}>
                                      <div>Início: {detail.started_at ? new Date(detail.started_at).toLocaleString('pt-BR') : 'Não iniciado'}</div>
                                      <div>Conclusão: {detail.finished_at ? new Date(detail.finished_at).toLocaleString('pt-BR') : 'Pendente'}</div>
                                    </div>
                                    {detail.approver_name && (
                                      <div style={{ fontSize: '12px', color: '#2563EB' }}>Aprovador: {detail.approver_name}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Pedidos do Cliente</h3>
            <OrdersTable orders={salesOrders} />
          </div>
        </>
      )}
      
      {showWorkflowModal && selectedWorkflowStep && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '32px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontWeight: '600', fontSize: '18px', color: 'var(--primary-text)' }}>
                Parecer da Etapa
              </h2>
              <button
                onClick={() => {
                  setShowWorkflowModal(false);
                  setSelectedWorkflowStep(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--secondary-text)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--primary-text)', whiteSpace: 'pre-wrap', minHeight: '60px' }}>
              {selectedWorkflowStep.parecer || 'Nenhum parecer registrado.'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowWorkflowModal(false);
                  setSelectedWorkflowStep(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessAnalysis;