import React, { useState, useEffect } from 'react';
import { mockCustomers } from './mockData';
import Select from 'react-select';
import styled from 'styled-components';
import { CurrencyDollar, User, Building, Phone, Envelope, X, CaretDown, CaretUp } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_USER_ID } from '../../constants/defaults';
import { getGlobalCompanyId } from '../../lib/globalState';

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  color: var(--secondary-text);
  font-size: 14px;
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: ${({ isEditing }) => (isEditing ? '24px' : '0')};
  background: ${({ isEditing }) => (isEditing ? 'white' : 'transparent')};
  border-radius: 8px;
  box-shadow: ${({ isEditing }) => (isEditing ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none')};
  border: ${({ isEditing }) => (isEditing ? '1px solid var(--border-color)' : 'none')};
`;

const FormSection = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: 8px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--secondary-text);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-text);
    transform: scale(1.1);
  }
`;

const FormCard = styled.form`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--border-color);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text);
    margin-bottom: 4px;
  }

  select,
  input,
  textarea,
  .react-select__control {
    width: 100%;
    height: 40px;
    min-height: 40px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0 12px;
    color: var(--primary-text);
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 1px var(--primary-blue);
    }
  }

  textarea {
    height: auto;
    min-height: 100px;
    padding: 12px;
  }

  .react-select__control {
    padding: 0;
    border-color: var(--border-color);
    box-shadow: none;
    
    &:hover {
      border-color: var(--primary-blue);
    }
    
    &--is-focused {
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 1px var(--primary-blue);
    }
  }

  .react-select__value-container {
    padding: 2px 8px;
  }

  .react-select__menu-portal {
    z-index: 9999;
  }
`;

const CustomerInfo = styled.div`
  background: #F8F9FA;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .info-item {
    p {
      font-size: 13px;
      color: var(--secondary-text);
      margin-bottom: 4px;
    }

    span {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text);
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);

  button {
    height: 26px;
    padding: 0 18px;
    border-radius: 4px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
    font-size: 15px;
    min-width: 90px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .submit-button {
    background: var(--primary-blue);
    color: white;
    border: none;
    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }

  .cancel-button {
    background: white;
    color: var(--secondary-text);
    border: 1px solid var(--border-color);
    &:hover:not(:disabled) {
      background: #f8f9fa;
    }
  }
`;

// Custom styles para react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: 40,
    borderRadius: 6,
    borderColor: state.isFocused ? 'var(--primary-blue, #2563eb)' : 'var(--border-color, #e5e7eb)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(37,99,235,0.15)' : 'none',
    '&:hover': {
      borderColor: 'var(--primary-blue, #2563eb)'
    },
    background: '#fff',
    fontSize: 16,
    paddingLeft: 2,
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 6,
    zIndex: 20,
    fontSize: 16,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? 'var(--primary-blue, #2563eb)' : state.isFocused ? '#f1f5f9' : '#fff',
    color: state.isSelected ? '#fff' : '#222',
    fontWeight: state.isSelected ? 600 : 400,
    cursor: 'pointer',
    fontSize: 16,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#222',
    fontWeight: 500,
    fontSize: 16,
    marginBottom: 10,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 10,
  }),
};

// Para os selects nativos, vamos estilizar com styled-components:
const StyledSelect = styled.select`
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 0 12px;
  font-size: 16px;
  color: var(--primary-text, #222);
  background: #fff;
  transition: border 0.2s;
  &:focus {
    outline: none;
    border-color: var(--primary-blue, #2563eb);
    box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
  }
`;

const InfoCardBase = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
`;

const UserInfoCard = styled(InfoCardBase)`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CustomerDetailsCard = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'isExpanded' })`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  margin-bottom: ${({ isExpanded }) => (isExpanded ? '16px' : '8px')};
  min-height: 88px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  
  & .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  & .title-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;
  }

  & .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 12px;
    max-height: ${({ isExpanded }) => (isExpanded ? '500px' : '0')};
    opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};
    overflow: hidden;
    transition: all 0.3s ease;
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  & .contacts {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    max-height: ${({ isExpanded }) => (isExpanded ? '500px' : '0')};
    opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};
    overflow: hidden;
    transition: all 0.3s ease;
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
`;

// Estilo para remover as setas do input type number
const NoSpinInput = styled.input`
  font-size: 20px;
  font-weight: 600;
  border: 2px solid #222;
  background: #F8F9FA;
  color: #222;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  appearance: textfield;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

// Função utilitária para formatar como moeda BRL
function formatCurrency(value) {
  const num = Number(value.replace(/[^\d]/g, '')) / 100;
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseCurrency(formatted) {
  return formatted.replace(/[^\d]/g, '');
}

// Função utilitária para formatar telefone
function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    // (XX) XXXX-XXXX
    return digits.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (m, g1, g2, g3) => {
      let out = '';
      if (g1) out += `(${g1}`;
      if (g1 && g1.length === 2) out += ') ';
      if (g2) out += g2;
      if (g3) out += '-' + g3;
      return out;
    });
  } else {
    // (XX) XXXXX-XXXX
    return digits.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (m, g1, g2, g3) => {
      let out = '';
      if (g1) out += `(${g1}`;
      if (g1 && g1.length === 2) out += ') ';
      if (g2) out += g2;
      if (g3) out += '-' + g3;
      return out;
    });
  }
}

function parsePhone(formatted) {
  return formatted.replace(/\D/g, '');
}

const NewLimitOrder = ({ initialData, onClose }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    classification: '',
    branch: '',
    requesterEmail: '',
    phone: '',
    paymentMethod: '',
    paymentTerm: '',
    creditLimitAmt: '',
    observation: '',
    nf_fisica: false,
    prazo_envio_oc: ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
  const [isCompanyDetailsExpanded, setIsCompanyDetailsExpanded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        classification: initialData.silim_classific_id?.toString() || '',
        branch: initialData.branch_id?.toString() || '',
        requesterEmail: initialData.email_solicitante || '',
        phone: initialData.customer_phone_num || '',
        paymentMethod: initialData.silim_meio_pgto_id?.toString() || '',
        paymentTerm: initialData.paymt_term || '',
        creditLimitAmt: initialData.credit_limit_amt ? (initialData.credit_limit_amt * 100).toString() : '',
        observation: initialData.comment || '',
        nf_fisica: initialData.nf_fisica || false,
        prazo_envio_oc: initialData.prazo_envio_oc || ''
      });

      if (initialData.customer_id) {
        setSelectedCustomer({
          id: initialData.customer_id,
          name: initialData.customer?.name || initialData.company?.name || '',
          company: ''
        });
      }
    }
  }, [initialData]);

  // Atualizar o campo de email do solicitante com o email do usuário logado quando o perfil for carregado
  useEffect(() => {
    if (userProfile && !initialData) {
      setFormData(prev => ({
        ...prev,
        requesterEmail: userProfile.email
      }));
    }
  }, [userProfile, initialData]);

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || !formData.classification || !formData.branch || !formData.paymentMethod) return;
    setLoading(true);

    const requestData = {
      company_id: getGlobalCompanyId(),
      customer_id: selectedCustomer.id,
      silim_classific_id: Number(formData.classification),
      branch_id: Number(formData.branch),
      email_solicitante: formData.requesterEmail,
      customer_phone_num: formData.phone,
      silim_meio_pgto_id: Number(formData.paymentMethod),
      paymt_term: formData.paymentTerm,
      cust_sap_id: customerDetails?.company_code || null,
      comment: formData.observation || null,
      credit_limit_amt: formData.creditLimitAmt ? Number(formData.creditLimitAmt) / 100 : null,
      status_id: 1,
      nf_fisica: formData.nf_fisica,
      prazo_envio_oc: formData.prazo_envio_oc || null
    };

    let saleOrderId;
    const { data, error } = initialData 
      ? await supabase
          .from('credit_limit_request')
          .update(requestData)
          .eq('id', initialData.id)
          .select()
      : await supabase
          .from('credit_limit_request')
          .insert([requestData])
          .select();

    if (!error && data) {
      saleOrderId = initialData ? initialData.id : data[0].id;
      
      // Create workflow record
      const workflowData = {
        company_Id: getGlobalCompanyId(),
        sale_order_id: saleOrderId,
        curent_step: 1, // Initial step
        dt_sent: [new Date().toISOString()],
        respons_role_id: [], // Will be populated by the workflow system
        dt_decision: [],
        respons_dec: [],
        decision_id: []
      };

      const { error: workflowError } = await supabase
        .from('workflow_sale_order')
        .insert([workflowData]);

      if (workflowError) {
        console.error('Error creating workflow record:', workflowError);
        alert('Erro ao criar registro de workflow!');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    if (!error) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        if (onClose) {
          onClose();
          window.dispatchEvent(new CustomEvent('navigateToMyRequests'));
        }
      }, 2000);
    } else {
      alert(initialData ? 'Erro ao atualizar solicitação!' : 'Erro ao enviar solicitação!');
    }
  };

  const handleDeleteOrder = async () => {
    if (!initialData?.id) return;
    setDeleteLoading(true);
    const { error } = await supabase
      .from('credit_limit_request')
      .delete()
      .eq('id', initialData.id);
    setDeleteLoading(false);
    setShowDeleteModal(false);
    if (!error && onClose) {
      onClose();
      window.dispatchEvent(new CustomEvent('navigateToMyRequests'));
    } else if (error) {
      alert('Erro ao excluir solicitação!');
    }
  };

  // Buscar dados do usuário logado
  useEffect(() => {
    async function fetchUserProfile() {
      // Obter a sessão atual do usuário
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // Buscar o perfil do usuário logado pelo seu ID real
        const { data, error } = await supabase
          .from('user_profile')
          .select('id, name, email')
          .eq('logged_id', session.user.id)
          .single();
          
        if (!error && data) {
          setUserProfile(data);
        } else {
          // Fallback: usar o email da sessão se o perfil não for encontrado
          setUserProfile({
            id: null,
            name: session.user.user_metadata?.name || 'Usuário',
            email: session.user.email
          });
        }
      }
    }
    fetchUserProfile();
  }, []);

  // Buscar detalhes do cliente selecionado
  useEffect(() => {
    async function fetchCustomerDetails() {
      if (!selectedCustomer) {
        setCustomerDetails(null);
        return;
      }
      const { data, error } = await supabase
        .from('customer')
        .select('id, name, company_code, costumer_email, costumer_phone, costumer_cnpj, costumer_razao_social, address:addr_id(*)')
        .eq('id', selectedCustomer.id)
        .single();
      if (!error && data) {
        let addressString = '';
        if (data.address && !Array.isArray(data.address)) {
          const addr = data.address;
          addressString = `${addr.street || ''}, ${addr.number || ''} - ${addr.city || ''} - ${addr.state || ''}`;
        }
        setCustomerDetails({
          ...data,
          address: addressString,
        });
      }
    }
    fetchCustomerDetails();
  }, [selectedCustomer]);

  // Buscar clientes do corporate_group do usuário logado
  useEffect(() => {
    async function fetchCustomersFromCorporateGroup() {
      try {
        // Obter a sessão atual do usuário
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) return;
        
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
        
        // 1. Buscar o corporate_group_id da company do usuário
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', userCompanyId)
          .single();
          
        if (companyError || !companyData?.corporate_group_id) {
          console.error('Erro ao buscar corporate_group_id:', companyError);
          return;
        }

        // 2. Buscar todas as companies desse corporate_group
        const { data: companiesData, error: companiesError } = await supabase
          .from('company')
          .select('id')
          .eq('corporate_group_id', companyData.corporate_group_id);
          
        if (companiesError || !companiesData?.length) {
          console.error('Erro ao buscar companies do grupo:', companiesError);
          return;
        }
        
        const companyIds = companiesData.map((c) => c.id);

        // 3. Buscar todos os customers dessas companies
        const { data: customersData, error: customersError } = await supabase
          .from('customer')
          .select('id, name, company_code')
          .in('company_id', companyIds);
          
        if (customersError || !customersData) {
          console.error('Erro ao buscar customers:', customersError);
          return;
        }

        setCustomerOptions(
          customersData.map((customer) => ({
            value: customer.id,
            label: customer.company_code ? `${customer.company_code} - ${customer.name}` : customer.name
          }))
        );
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    }
    
    fetchCustomersFromCorporateGroup();
  }, []);

  // Buscar opções dinâmicas ao carregar a tela
  useEffect(() => {
    // Classificação
    supabase
      .from('silim_classificacao')
      .select('id, name')
      .then(({ data }) => {
        if (data) setClassificationOptions(data.map((item) => ({ value: item.id, label: item.name })));
      });
    // Meio de Pagamento
    supabase
      .from('silim_meio_pgto')
      .select('id, name')
      .then(({ data }) => {
        if (data) setPaymentMethodOptions(data.map((item) => ({ value: item.id, label: item.name })));
      });
    // Filiais (empresas do mesmo corporate_group)
    async function fetchBranches() {
      const companyId = getGlobalCompanyId();
      
      const { data: companyData } = await supabase
        .from('company')
        .select('corporate_group_id')
        .eq('id', companyId)
        .single();
      if (!companyData?.corporate_group_id) return;
      const { data: companiesData } = await supabase
        .from('company')
        .select('id, name')
        .eq('corporate_group_id', companyData.corporate_group_id);
      if (companiesData) setBranchOptions(companiesData.map((c) => ({ value: c.id, label: c.name })));
    }
    fetchBranches();
  }, []);

  return (
    <FormContainer>
      <HeaderContainer>
        <FormTitle>{initialData ? 'Editar Solicitação de Limite de Crédito' : 'Nova Solicitação de Limite de Crédito'}</FormTitle>
        {onClose && (
          <CloseButton onClick={onClose}>
            <X size={24} weight="bold" />
          </CloseButton>
        )}
      </HeaderContainer>
      {userProfile && (
        <UserInfoCard>
          <User size={24} />
          <div>
            <div style={{ fontWeight: 500 }}>{userProfile.name}</div>
            <div style={{ color: 'var(--secondary-text)', fontSize: 14 }}>{userProfile.email}</div>
          </div>
        </UserInfoCard>
      )}
      {customerDetails && (
        <CustomerDetailsCard isExpanded={isCompanyDetailsExpanded}>
          <div className="header" onClick={() => setIsCompanyDetailsExpanded(!isCompanyDetailsExpanded)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Building size={20} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600, fontSize: 16, textAlign: 'left' }}>{customerDetails.name}</div>
                <div style={{ color: 'var(--secondary-text)', fontSize: 14, textAlign: 'left' }}>{customerDetails.company_code && `Código: ${customerDetails.company_code}`}</div>
              </div>
            </div>
            {isCompanyDetailsExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
          </div>
          <div className="info-grid">
            <div>
              <div style={{ fontSize: 13, color: 'var(--secondary-text)' }}>Razão Social</div>
              <div style={{ fontWeight: 500 }}>{customerDetails.costumer_razao_social || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--secondary-text)' }}>CNPJ</div>
              <div style={{ fontWeight: 500 }}>{customerDetails.costumer_cnpj || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--secondary-text)' }}>Endereço</div>
              <div style={{ fontWeight: 500 }}>{customerDetails.address || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--secondary-text)' }}>E-mail</div>
              <div style={{ fontWeight: 500 }}>{customerDetails.costumer_email || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--secondary-text)' }}>Telefone</div>
              <div style={{ fontWeight: 500 }}>{customerDetails.costumer_phone || '-'}</div>
            </div>
          </div>
          <div className="contacts">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Contatos</div>
            <div style={{ color: 'var(--secondary-text)' }}>Nenhum contato cadastrado.</div>
          </div>
        </CustomerDetailsCard>
      )}
      
      <FormCard onSubmit={(e) => {
        e.preventDefault();
        handleSubmitOrder();
      }}>
        <FormSection>
          <FormGroup>
            <label>Cliente *</label>
            <Select
              value={selectedCustomer ? customerOptions.find(opt => opt.value === Number(selectedCustomer.id)) || null : null}
              onChange={(option) => {
                if (option) {
                  setSelectedCustomer({ id: option.value, name: option.label, company: option.label });
                } else {
                  setSelectedCustomer(null);
                }
              }}
              options={customerOptions}
              classNamePrefix="react-select"
              placeholder="Selecione um cliente"
              isClearable
              styles={customSelectStyles}
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <label>Classificação *</label>
              <StyledSelect 
                name="classification"
                required
                value={formData.classification}
                onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
              >
                <option value="">Selecione uma opção</option>
                {classificationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </StyledSelect>
            </FormGroup>

            <FormGroup>
              <label>Filial *</label>
              <StyledSelect 
                name="branch"
                required
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
              >
                <option value="">Selecione uma filial</option>
                {branchOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </StyledSelect>
            </FormGroup>
          </div>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-2 gap-4">
            {/* <FormGroup>
              <label>E-mail do Solicitante *</label>
              <input
                type="email"
                name="requesterEmail"
                required
                value={formData.requesterEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                placeholder="exemplo@email.com"
              />
            </FormGroup> */}

            <FormGroup>
              <label>Telefone(s) *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formatPhone(formData.phone)}
                onChange={e => setFormData(prev => ({ ...prev, phone: parsePhone(e.target.value) }))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </FormGroup>
          </div>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <label>Meio de Pagamento *</label>
              <StyledSelect 
                name="paymentMethod"
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="">Selecione uma opção</option>
                {paymentMethodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </StyledSelect>
            </FormGroup>

            <FormGroup>
              <label>Prazo de Pagamento *</label>
              <input
                type="text"
                name="paymentTerm"
                required
                placeholder="Ex: 30/60/90 dias"
                value={formData.paymentTerm}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentTerm: e.target.value }))}
              />
            </FormGroup>
          </div>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <label style={{ fontWeight: 600, fontSize: 16, color: 'var(--primary-blue)' }}>Limite Solicitado *</label>
              <NoSpinInput
                type="text"
                name="creditLimitAmt"
                required
                inputMode="numeric"
                value={formatCurrency(formData.creditLimitAmt)}
                onChange={e => {
                  const raw = parseCurrency(e.target.value);
                  setFormData(prev => ({ ...prev, creditLimitAmt: raw }));
                }}
                placeholder="R$ 0,00"
              />
            </FormGroup>

            <FormGroup>
              <label>Recebimento de NF Física</label>
              <StyledSelect
                name="nf_fisica"
                value={formData.nf_fisica ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, nf_fisica: e.target.value === 'true' }))}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </StyledSelect>
            </FormGroup>
          </div>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <label>Prazo para Envio da OC</label>
              <input
                type="text"
                name="prazo_envio_oc"
                value={formData.prazo_envio_oc}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo_envio_oc: e.target.value }))}
                placeholder="Ex: 30 dias"
              />
            </FormGroup>
          </div>
        </FormSection>

        <FormGroup>
          <label>Observação</label>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
            placeholder="Digite suas observações aqui..."
          />
        </FormGroup>

        <FormActions>
          {onClose && (
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
          )}
          {initialData && initialData.status_id === 1 && (
            <button
              type="button"
              className="cancel-button"
              style={{ color: 'var(--danger, #dc2626)', borderColor: 'var(--danger, #dc2626)' }}
              onClick={() => { console.log('Abrindo modal de exclusão'); setShowDeleteModal(true); }}
              disabled={loading || deleteLoading}
            >
              Excluir
            </button>
          )}
          <button
            type="type"
            className="submit-button"
            onClick={handleSubmitOrder}
            disabled={loading || !selectedCustomer || !formData.classification || !formData.branch || !formData.paymentMethod}
          >
            {initialData ? 'Atualizar' : 'Enviar'} Solicitação
          </button>
        </FormActions>
      </FormCard>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
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
          <div style={{ background: 'white', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Confirmar exclusão</div>
            <div style={{ color: 'var(--secondary-text)', marginBottom: 24 }}>Tem certeza que deseja excluir esta solicitação? Esta ação não poderá ser desfeita.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                className="cancel-button"
                style={{ height: 32, minWidth: 80 }}
                onClick={() => { console.log('Cancelou exclusão'); setShowDeleteModal(false); }}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="submit-button"
                style={{ background: 'var(--danger, #dc2626)', color: 'white', height: 32, minWidth: 80 }}
                onClick={() => { console.log('Tentando excluir', initialData?.id); handleDeleteOrder(); }}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {showSuccessMessage && (
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
            borderRadius: 8, 
            padding: 32, 
            minWidth: 320, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: 18, 
              marginBottom: 16,
              color: 'var(--success, #059669)'
            }}>
              {initialData ? 'Solicitação atualizada com sucesso!' : 'Solicitação enviada com sucesso!'}
            </div>
            <div style={{ color: 'var(--secondary-text)' }}>
              Redirecionando...
            </div>
          </div>
        </div>
      )}
    </FormContainer>
  );
};

export default NewLimitOrder;