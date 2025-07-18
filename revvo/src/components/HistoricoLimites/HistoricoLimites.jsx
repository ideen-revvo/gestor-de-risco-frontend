import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import { FunnelSimple, CaretDown } from '@phosphor-icons/react';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

const Header = styled.div`
  padding: 24px;
  background: white;
  border-bottom: 1px solid var(--border-color);
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--background);
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
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

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .filter-group {
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text);
      margin-bottom: 4px;
    }

    select {
      width: 100%;
      height: 40px;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0 12px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-blue);
      }
    }
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #F8F9FA;
    padding: 16px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
    color: var(--primary-text);
  }

  tr:hover {
    background: #F8F9FA;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  &.high-usage {
    background: #FEE2E2;
    color: #DC2626;
  }

  &.medium-usage {
    background: #FEF3C7;
    color: #D97706;
  }

  &.low-usage {
    background: #D1FAE5;
    color: #059669;
  }

  &.em-analise {
    background: #DBEAFE;
    color: #2563EB;
  }

  &.pendente-doc {
    background: #FEF3C7;
    color: #D97706;
  }

  &.aprovacao-final {
    background: #F3E8FF;
    color: #7C3AED;
  }

  &.high-severity {
    background: #FEE2E2;
    color: #DC2626;
  }

  &.medium-severity {
    background: #FED7AA;
    color: #EA580C;
  }

  &.low-severity {
    background: #FEF3C7;
    color: #D97706;
  }
`;

const TrendIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .trend-up {
    color: #DC2626;
  }

  .trend-down {
    color: #059669;
  }
`;

const HistoricoLimites = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    cliente: '',
    status: 'ativo',
    periodo: ''
  });

  // Mock data para limites ativos
  const activeLimitsData = [
    {
      id: 1,
      name: 'Hospital Santa Casa',
      document: '12.345.678/0001-90',
      totalLimit: 500000,
      usedLimit: 325000,
      usagePercentage: 65,
      trend: 'up',
      trendValue: 12
    },
    {
      id: 2,
      name: 'Clínica Bella Vita',
      document: '98.765.432/0001-10',
      totalLimit: 250000,
      usedLimit: 87500,
      usagePercentage: 35,
      trend: 'down',
      trendValue: 8
    },
    {
      id: 3,
      name: 'Instituto Médico São Paulo',
      document: '11.222.333/0001-44',
      totalLimit: 750000,
      usedLimit: 637500,
      usagePercentage: 85,
      trend: 'up',
      trendValue: 15
    }
  ];

  // Mock data para limites em revisão
  const limitsUnderRevisionData = [
    {
      id: 1,
      name: 'Centro Médico Avançado',
      document: '55.666.777/0001-88',
      currentLimit: 300000,
      requestedLimit: 450000,
      reason: 'Aumento de Faturamento',
      status: 'Em Análise',
      timeInAnalysis: '5 dias'
    },
    {
      id: 2,
      name: 'Hospital Regional Norte',
      document: '99.888.777/0001-66',
      currentLimit: 600000,
      requestedLimit: 400000,
      reason: 'Deterioração Score',
      status: 'Pendente Documentação',
      timeInAnalysis: '12 dias'
    },
    {
      id: 3,
      name: 'Clínica Especializada Sul',
      document: '44.333.222/0001-11',
      currentLimit: 200000,
      requestedLimit: 350000,
      reason: 'Expansão Operacional',
      status: 'Aprovação Final',
      timeInAnalysis: '3 dias'
    }
  ];

  // Mock data para limites rejeitados
  const rejectedLimitsData = [
    {
      id: 1,
      name: 'Clínica Popular Centro',
      document: '77.888.999/0001-22',
      requestedLimit: 400000,
      rejectionReason: {
        primary: 'Score de Crédito Insuficiente',
        details: 'Score abaixo do mínimo exigido para o valor solicitado',
        severity: 'high'
      },
      analysisDate: '15/12/2024',
      analyst: 'Ana Silva',
      newRequestAllowed: true,
      waitingPeriod: '30 dias'
    },
    {
      id: 2,
      name: 'Hospital Comunitário',
      document: '33.444.555/0001-77',
      requestedLimit: 600000,
      rejectionReason: {
        primary: 'Histórico de Inadimplência',
        details: 'Registros de atraso nos últimos 6 meses',
        severity: 'medium'
      },
      analysisDate: '10/12/2024',
      analyst: 'Carlos Santos',
      newRequestAllowed: true,
      waitingPeriod: '60 dias'
    },
    {
      id: 3,
      name: 'Centro de Diagnóstico',
      document: '66.777.888/0001-33',
      requestedLimit: 300000,
      rejectionReason: {
        primary: 'Documentação Incompleta',
        details: 'Faltam comprovantes de faturamento atualizados',
        severity: 'low'
      },
      analysisDate: '08/12/2024',
      analyst: 'Maria Oliveira',
      newRequestAllowed: true,
      waitingPeriod: '15 dias'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsageClass = (percentage) => {
    if (percentage >= 80) return 'high-usage';
    if (percentage >= 60) return 'medium-usage';
    return 'low-usage';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Em Análise': return 'em-analise';
      case 'Pendente Documentação': return 'pendente-doc';
      case 'Aprovação Final': return 'aprovacao-final';
      default: return 'em-analise';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high': return 'high-severity';
      case 'medium': return 'medium-severity';
      case 'low': return 'low-severity';
      default: return 'medium-severity';
    }
  };

  const renderActiveLimits = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Limite Total</th>
            <th>Limite Utilizado</th>
            <th>Uso (%)</th>
            <th>Tendência</th>
          </tr>
        </thead>
        <tbody>
          {activeLimitsData.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.document}</td>
              <td>{formatCurrency(row.totalLimit)}</td>
              <td>{formatCurrency(row.usedLimit)}</td>
              <td>
                <StatusBadge className={getUsageClass(row.usagePercentage)}>
                  {row.usagePercentage}%
                </StatusBadge>
              </td>
              <td>
                <TrendIcon>
                  {row.trend === 'up' ? (
                    <ArrowUpRight className="trend-up" size={16} />
                  ) : (
                    <ArrowDownRight className="trend-down" size={16} />
                  )}
                  <span>{row.trendValue}%</span>
                </TrendIcon>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  const renderLimitsUnderRevision = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Limite Atual</th>
            <th>Limite Solicitado</th>
            <th>Motivo</th>
            <th>Status</th>
            <th>Tempo em Análise</th>
          </tr>
        </thead>
        <tbody>
          {limitsUnderRevisionData.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.document}</td>
              <td>{formatCurrency(row.currentLimit)}</td>
              <td>{formatCurrency(row.requestedLimit)}</td>
              <td>{row.reason}</td>
              <td>
                <StatusBadge className={getStatusClass(row.status)}>
                  {row.status}
                </StatusBadge>
              </td>
              <td>{row.timeInAnalysis}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  const renderRejectedLimits = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Limite Solicitado</th>
            <th>Motivo da Rejeição</th>
            <th>Detalhes</th>
            <th>Gravidade</th>
            <th>Data da Análise</th>
            <th>Analista</th>
            <th>Novo Pedido</th>
          </tr>
        </thead>
        <tbody>
          {rejectedLimitsData.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.document}</td>
              <td>{formatCurrency(row.requestedLimit)}</td>
              <td>{row.rejectionReason.primary}</td>
              <td>{row.rejectionReason.details}</td>
              <td>
                <StatusBadge className={getSeverityClass(row.rejectionReason.severity)}>
                  {row.rejectionReason.severity}
                </StatusBadge>
              </td>
              <td>{row.analysisDate}</td>
              <td>{row.analyst}</td>
              <td>{row.newRequestAllowed ? `Em ${row.waitingPeriod}` : 'Não permitido'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  const renderFilteredContent = () => {
    if (filters.status === 'ativo') return renderActiveLimits();
    if (filters.status === 'revisao') return renderLimitsUnderRevision();
    if (filters.status === 'rejeitado') return renderRejectedLimits();
    return null;
  };

  return (
    <Container>
      <Header>
        <h2>Histórico de Limites</h2>
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
                <label>Cliente</label>
                <select
                  value={filters.cliente}
                  onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
                >
                  <option value="">Todos os clientes</option>
                  <option value="hospital">Hospital Santa Casa</option>
                  <option value="clinica">Clínica Bella Vita</option>
                  <option value="instituto">Instituto Médico São Paulo</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="ativo">Ativo</option>
                  <option value="revisao">Em Revisão</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Período</label>
                <select
                  value={filters.periodo}
                  onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                >
                  <option value="">Todos os períodos</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="180">Últimos 6 meses</option>
                  <option value="365">Último ano</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </FilterSection>
      {renderFilteredContent()}
    </Container>
  );
};

export default HistoricoLimites; 