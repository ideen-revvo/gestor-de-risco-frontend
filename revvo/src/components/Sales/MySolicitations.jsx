import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { FunnelSimple, CaretDown, CaretUp, Clock, CheckCircle } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import RequestDetails from './RequestDetails';
import NewLimitOrder from './NewLimitOrder';
import { getCreditLimitRequests } from '../../services/creditLimitService';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.header`
  margin-bottom: 24px;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 8px;
  margin: 24px 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .filter-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon {
      transition: transform 0.3s ease;
      
      &.open {
        transform: rotate(180deg);
      }
    }
  }

  .filter-content {
    padding: 24px;
    background: #F8F9FA;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .filter-group {
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text);
      margin-bottom: 4px;
    }

    select,
    .react-select__control {
      width: 100%;
      height: 40px;
      min-height: 40px;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }
  }
`;

const InboxSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 24px;

  .section-header {
    padding: 16px;
    background: #F8F9FA;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .left {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text);
        margin: 0;
      }

      .count {
        background: #E9ECEF;
        color: var(--secondary-text);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
`;

const RequestCard = styled.div`
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F8F9FA;
  }

  .card-content {
    display: flex;
    justify-content: space-between;
  }

  .left-content {
    .company-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .request-date {
      font-size: 13px;
      color: var(--secondary-text);
    }
  }

  .right-content {
    text-align: right;

    .amount {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;

      &.status-1 { background: #2563eb22; color: #607dad; }
      &.status-2 { background: #F9CF5822; color: #B58E2D; }
      &.status-3 { background: #3EB65522; color: #3EB655; }
      &.status-4 { background: #CC171722; color: #CC1717; }
    }
  }
`;

const MySolicitations = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [userCompanyId, setUserCompanyId] = useState(null); // Alterado de userId para userCompanyId
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Buscar o company_id do usuário logado
  useEffect(() => {
    async function getUserCompanyId() {
      try {
        // Obter a sessão atual do usuário
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
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
        
        setUserCompanyId(userProfileData.company_id);
      } catch (error) {
        console.error('Erro ao obter company_id do usuário:', error);
      }
    }
    
    getUserCompanyId();
  }, []);

  useEffect(() => {
    async function fetchRequests() {
      if (!userCompanyId) return;
      try {
        const data = await getCreditLimitRequests({
          companyId: userCompanyId,
          statusId: filterStatus,
          startDate: filterStartDate,
          endDate: filterEndDate
        });
        setRequests(data);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      }
      setLoading(false);
    }
    fetchRequests();
  }, [userCompanyId, filterStatus, filterStartDate, filterEndDate]);

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  const handleEditRequest = (request) => {
    setIsEditing(true);
    setSelectedRequest(request);
  };

  const getStatusName = (status) => {
    if (!status) return 'Novo';
    return status.name || 'Novo';
  };

  const pendingRequests = requests.filter(r => r.status_id === 1 || r.status_id === 2);
  const completedRequests = requests.filter(r => r.status_id === 3 || r.status_id === 4);

  if (isEditing && selectedRequest) {
    return (
      <NewLimitOrder 
        initialData={selectedRequest}
        onClose={() => {
          setIsEditing(false);
          setSelectedRequest(null);
        }}
      />
    );
  }

  if (selectedRequest) {
    return (
      <RequestDetails 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)}
        onEdit={handleEditRequest}
      />
    );
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <h2 className="text-2xl font-semibold">Minhas Solicitações de Limite</h2>
        </Header>
        <div className="text-center text-gray-500 mt-8">
          Carregando solicitações...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2 className="text-2xl font-semibold">Minhas Solicitações de Limite</h2>
      </Header>

      <FilterSection>
        <div className="filter-header" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <div className="left">
            <FunnelSimple size={20} />
            <span>Filtros</span>
          </div>
          <CaretDown size={20} className={`icon ${isFilterOpen ? 'open' : ''}`} />
        </div>
        {isFilterOpen && (
          <div className="filter-content">
            <div className="filters">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="1">Pendente</option>
                  <option value="2">Em Análise</option>
                  <option value="3">Aprovado</option>
                  <option value="4">Rejeitado</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Data da Solicitação</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                    style={{ width: '50%' }}
                  />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </FilterSection>

      <InboxSection>
        <div className="section-header" onClick={() => setShowPending(!showPending)}>
          <div className="left">
            <Clock size={20} weight="fill" color="#F9CF58" />
            <h3>Pendentes</h3>
            <span className="count">{pendingRequests.length}</span>
          </div>
          {showPending ? <CaretUp size={18} /> : <CaretDown size={18} />}
        </div>
        {showPending && pendingRequests.map((request) => (
          <RequestCard 
            key={request.id} 
            onClick={() => handleRequestClick(request)}
          >
            <div className="card-content">
              <div className="left-content">
                <div className="company-name">
                  {request.customer ? 
                    `${request.customer.company_code || ''} - ${request.customer.name || ''}` : 
                    request.company?.name || 'Nome não disponível'}
                </div>
                <div className="request-date">
                  Solicitado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="right-content">
                <div className="amount">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(request.credit_limit_amt)}
                </div>
                <div className={`status-badge status-${request.status_id}`}>
                  {getStatusName(request.status)}
                </div>
              </div>
            </div>
          </RequestCard>
        ))}
      </InboxSection>

      <InboxSection>
        <div className="section-header" onClick={() => setShowCompleted(!showCompleted)}>
          <div className="left">
            <CheckCircle size={20} weight="fill" color="#3EB655" />
            <h3>Concluídas</h3>
            <span className="count">{completedRequests.length}</span>
          </div>
          {showCompleted ? <CaretUp size={18} /> : <CaretDown size={18} />}
        </div>
        {showCompleted && completedRequests.map((request) => (
          <RequestCard 
            key={request.id} 
            onClick={() => handleRequestClick(request)}
          >
            <div className="card-content">
              <div className="left-content">
                <div className="company-name">
                  {request.customer ? 
                    `${request.customer.company_code || ''} - ${request.customer.name || ''}` : 
                    request.company?.name || 'Nome não disponível'}
                </div>
                <div className="request-date">
                  Solicitado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="right-content">
                <div className="amount">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(request.credit_limit_amt)}
                </div>
                <div className={`status-badge status-${request.status_id}`}>
                  {getStatusName(request.status)}
                </div>
              </div>
            </div>
          </RequestCard>
        ))}
      </InboxSection>

      {requests.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Nenhuma solicitação encontrada
        </div>
      )}
    </Container>
  );
};

export default MySolicitations;