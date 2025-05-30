import React, { useState } from 'react';
import styled from 'styled-components';
import { X, User } from '@phosphor-icons/react';
import OrdersTable from '../OrdersTable';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const CaixaEntradaContainer = styled.div`
  background: white; 
  padding: 24px; 
  border-radius: 8px; 
  margin-bottom: 16px; 
  border: 1px solid var(--border-color);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const RequestsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
`;

const RequestCard = styled.div`
  flex: 0 0 300px;
  cursor: pointer;
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  &.selected {
    flex: 0 0 280px;
    cursor: default;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }

    .items-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);

      h4 {
        font-size: 13px;
        color: var(--secondary-text);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .item {
        padding: 8px;
        background: white;
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-name {
          margin-bottom: 4px;
          font-weight: 500;
        }

        .item-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--secondary-text);
        }
      }
    }
  }
`;

const DetailView = styled.div`
  flex: 1;
  margin-left: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 24px;
  position: relative;

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text);
    padding: 8px;
    
    &:hover {
      color: var(--primary-text);
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 24px;
  }

  .detail-section {
    background: var(--background);
    padding: 16px;
    border-radius: 8px;

    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .occurrence-count {
      background: var(--primary-blue);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .no-occurrences {
      color: var(--secondary-text);
      font-size: 13px;
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
      }

      .details {
        font-size: 13px;
        color: var(--secondary-text);
        margin-top: 4px;
      }
    }
  }

  .score-section {
    text-align: center;
    padding: 24px;
    
    .score-value {
      font-size: 48px;
      font-weight: 600;
      color: var(--primary-blue);
      margin: 16px 0;
    }

    .score-label {
      font-size: 14px;
      color: var(--success);
      padding: 4px 12px;
      background: rgba(62, 182, 85, 0.1);
      border-radius: 16px;
      display: inline-block;
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

const DashboardOrders = ({
  salesOrders,
  orderDetails,
  selectedInvoice,
  setSelectedInvoice,
  selectedInstallment,
  setSelectedInstallment,
  selectedDetailCard,
  setSelectedDetailCard,
  handleRowClick,
  handleInstallmentClick,
  mockOrderItems,
  mockDetailData
}) => {
  const [showApprovalModal, setShowApprovalModal] = React.useState(false);
  const [showApprovedModal, setShowApprovedModal] = React.useState(false);
  const [creditLimit, setCreditLimit] = React.useState('');
  const [prepaidLimit, setPrepaidLimit] = React.useState('');
  const [comments, setComments] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [customerDetails, setCustomerDetails] = React.useState(null);
  const [userCompanyId, setUserCompanyId] = React.useState(null);
  const [loadingCalculatedLimit, setLoadingCalculatedLimit] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  
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

  const handleSaveAnalysis = async () => {
    // Validate if we have a selected customer and credit limit
    if (!selectedDetailCard?.customer_id) {
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
      // 1. Create a record in credit_limit_amount table
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
      
      // 2. Update customer with the credit_limits_id
      const customerId = selectedDetailCard.customer_id || selectedDetailCard.customer?.id;
      
      if (!customerId) {
        throw new Error('ID do cliente não encontrado');
      }
      
      const { error: customerUpdateError } = await supabase
        .from('customer')
        .update({ credit_limits_id: creditLimitData.id })
        .eq('id', customerId);
        
      if (customerUpdateError) throw customerUpdateError;
      
      toast.success('Análise financeira salva com sucesso!');
      
    } catch (error) {
      console.error('Error saving credit limit:', error);
      toast.error(`Erro ao salvar análise financeira: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

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

  // Add this new function to load the calculated limit
  const handleLoadCalculatedLimit = async () => {
    if (!selectedDetailCard?.customer_id) return;
    
    setLoadingCalculatedLimit(true);
    try {
      // First get the customer's credit_limits_id
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('credit_limits_id')
        .eq('id', selectedDetailCard.customer_id)
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
      toast.error('Erro ao carregar limite calculado');
    } finally {
      setLoadingCalculatedLimit(false);
    }
  };

  // Function to fetch workflow data
  const fetchWorkflowData = async (creditLimitReqId) => {
    if (!creditLimitReqId) return;
    
    setLoadingWorkflow(true);
    try {
      // First get the workflow_sale_order
      const { data: workflowOrder, error: workflowOrderError } = await supabase
        .from('workflow_sale_order')
        .select('*')
        .eq('credit_limit_req_id', creditLimitReqId)
        .single();

      if (workflowOrderError) throw workflowOrderError;

      if (workflowOrder) {
        // Then get the workflow details with jurisdiction information
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

        if (workflowDetailsError) throw workflowDetailsError;

        setWorkflowData({
          order: workflowOrder,
          details: workflowDetails
        });
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast.error('Erro ao carregar dados do workflow');
    } finally {
      setLoadingWorkflow(false);
    }
  };

  // Effect to fetch workflow data when selectedDetailCard changes
  React.useEffect(() => {
    if (selectedDetailCard?.id) {
      fetchWorkflowData(selectedDetailCard.id);
    }
  }, [selectedDetailCard]);

  return (
    <>
      <CaixaEntradaContainer>
        <h3 style={{ marginBottom: '16px' }}>Visão Geral de Risco</h3>
        
        <RequestsContainer>
          {selectedDetailCard ? (
            <>
              <RequestCard 
                className="selected"
              >
                <div style={{ marginBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {selectedDetailCard.customer?.name || (selectedDetailCard.status ? selectedDetailCard.customer?.name : 'N/A')}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '500',
                    backgroundColor: 'rgba(62, 182, 85, 0.1)', 
                    color: '#3EB655', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: '#3EB655',
                      display: 'inline-block'
                    }}></span>
                    {selectedDetailCard.status?.name || 'Aprovado'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                      {new Date(selectedDetailCard.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                      {selectedDetailCard.status ? 
                        `Solicitação #${selectedDetailCard.id}` : 
                        `Venc.: ${selectedDetailCard.due_date ? new Date(selectedDetailCard.due_date).toLocaleDateString('pt-BR') : 'N/A'}`}
                  </div>
                </div>
                
                
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Limite solicitado</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>
                    R$ {(selectedDetailCard.total_amt || selectedDetailCard.credit_limit_amt)?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                    {selectedDetailCard.status ? 'Solicitado por:' : 'Condição de pagamento'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                    nomedoconsultor@silimed.com.br
                  </div>
                </div>
                <div className='items-section' style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Limite calculado</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}> R$ 250.000,00</div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '20px' }}>
                      {new Date(selectedDetailCard.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className='items-section' style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Limite atual</div>
                    <div style={{ fontSize: '14px' }}>R$ 70.000,00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>% utilizado</div>
                    <div style={{ fontSize: '14px' }}>45%</div>
                  </div>
                </div>

                <div className="items-section">
                  <h4 style={{ fontSize: '13px', color: 'black', marginBottom: '12px', fontWeight: '500' }}>
                    Workflow de Aprovação
                  </h4>
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px'}}>
                    {loadingWorkflow ? (
                      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--secondary-text)' }}>
                        Carregando workflow...
                      </div>
                    ) : workflowData?.details ? (
                      workflowData.details.map((detail, index) => (
                        <div 
                          key={detail.id}
                          onClick={() => detail.approval === null && setShowApprovalModal(true)}
                          style={{ 
                            padding: '8px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: detail.approval === null ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: detail.approval === null ? 'pointer' : 'default'
                          }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{detail.jurisdiction?.name || 'N/A'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                              {detail.approval === null ? 'Pendente' : 
                               detail.approval ? 'Aprovado' : 'Rejeitado'}
                            </div>
                          </div>
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: detail.approval === null ? 'var(--border-color)' :
                                      detail.approval ? 'var(--success)' : '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: 'white', fontSize: '10px' }}>
                              {detail.approval === null ? '!' : 
                               detail.approval ? '✓' : '✕'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--secondary-text)' }}>
                        Nenhum workflow encontrado
                      </div>
                    )}
                  </div>
                </div>
              </RequestCard>
              
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
            </>
          ) : (
            salesOrders.slice(0, 5).map(order => (
              <RequestCard 
                key={order.id}
                onClick={() => {
                  setSelectedDetailCard(order);
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{order.customer?.name || 'N/A'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Valor</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>
                    R$ {order.total_amt?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Condição de pagamento</div>
                  <div style={{ fontSize: '14px' }}>30/60/90 dias</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                    Venc.: {order.due_date ? new Date(order.due_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Limite disponível</div>
                  <div style={{ fontSize: '14px' }}>R$ 500.000,00</div>
                </div>
              </RequestCard>
            ))
          )}
        </RequestsContainer>
      </CaixaEntradaContainer>

      {selectedDetailCard && (
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
            disabled={loadingCalculatedLimit || !selectedDetailCard?.customer_id}
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
      )}

      {/* Orders Table Section */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)',
        marginTop: selectedDetailCard ? '24px' : '0'
      }}>
        <OrdersTable 
          orders={orderDetails}
          onRowClick={handleRowClick}
          selectedOrder={selectedInvoice}
          onInstallmentClick={handleInstallmentClick}
          selectedInstallment={selectedInstallment}
        />
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <Modal>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Aprovação Comercial</h2>
              <button 
                className="close-button"
                onClick={() => setShowApprovalModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-field">
              <div className="label">Alçada</div>
              <div>Gerente Comercial</div>
            </div>

            <div className="form-field">
              <div className="label">Data de Recebimento</div>
              <div>15/03/2024, 09:30:00</div>
            </div>

            <div className="form-field">
              <div className="label">Prazo</div>
              <div>15/03/2024, 13:30:00</div>
            </div>

            <div className="form-field">
              <div className="label">Parecer</div>
              <textarea placeholder="Digite seu parecer..." />
            </div>

            <div className="actions">
              <button 
                className="reject"
                onClick={() => setShowApprovalModal(false)}
              >
                Rejeitar
              </button>
              <button 
                className="approve"
                onClick={async () => {
                  try {
                    // Get the current workflow step
                    const currentStep = workflowData.details.find(detail => detail.approval === null);
                    if (!currentStep) return;

                    // Update the current step with approval
                    const { error: updateError } = await supabase
                      .from('workflow_details')
                      .update({
                        approval: true,
                        approver: (await supabase.auth.getUser()).data.user?.id,
                        finished_at: new Date().toISOString()
                      })
                      .eq('id', currentStep.id);

                    if (updateError) throw updateError;

                    // Find the next step
                    const nextStep = workflowData.details.find(detail => 
                      detail.workflow_step === currentStep.workflow_step + 1
                    );

                    // If there is a next step, set its started_at
                    if (nextStep) {
                      const { error: nextStepError } = await supabase
                        .from('workflow_details')
                        .update({
                          started_at: new Date().toISOString()
                        })
                        .eq('id', nextStep.id);

                      if (nextStepError) throw nextStepError;
                    }

                    // Refresh workflow data
                    await fetchWorkflowData(selectedDetailCard.id);
                    
                    setShowApprovalModal(false);
                    setShowApprovedModal(true);
                  } catch (error) {
                    console.error('Error approving workflow step:', error);
                    toast.error('Erro ao aprovar etapa do workflow');
                  }
                }}
              >
                Aprovar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approved Modal */}
      {showApprovedModal && (
        <Modal>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">ETAPA APROVADA</h2>
              <button 
                className="close-button"
                onClick={() => setShowApprovedModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-field">
              <div className="label">Alçada</div>
              <div>RESPONSÁVEL</div>
            </div>

            <div className="form-field">
              <div className="label">Data de Recebimento</div>
              <div>15/03/2024, 09:30:00</div>
            </div>

            <div className="form-field">
              <div className="label">Prazo</div>
              <div>15/03/2024, 13:30:00</div>
            </div>

            <div className="form-field">
              <div className="label">Parecer</div>
              <p
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  resize: 'vertical'
                }}
              >PARECER DEFINIDO</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DashboardOrders;