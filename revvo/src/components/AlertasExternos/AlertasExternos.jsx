import React from 'react';
import styled from 'styled-components';
import { Gavel, FileWarning, FileCheck } from 'lucide-react';

const Container = styled.div`
  width: 100%;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AlertCard = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const IconContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.red {
    background: #FEE2E2;
    color: #DC2626;
  }

  &.orange {
    background: #FED7AA;
    color: #EA580C;
  }

  &.blue {
    background: #DBEAFE;
    color: #2563EB;
  }
`;

const AlertDetails = styled.div`
  flex: 1;

  .company-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text);
    margin-bottom: 2px;
  }

  .alert-description {
    font-size: 12px;
    color: var(--secondary-text);
    margin-bottom: 2px;
  }

  .alert-date {
    font-size: 11px;
    color: #9CA3AF;
  }
`;

const AlertValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text);
`;

const AlertasExternos = () => {
  // Mock data para processos judiciais
  const legalProcesses = [
    {
      company: 'Hospital Santa Casa',
      details: 'Processo trabalhista em andamento',
      date: '15/12/2024',
      value: 85000
    },
    {
      company: 'Clínica Bella Vita',
      details: 'Ação de cobrança movida',
      date: '12/12/2024',
      value: 45000
    },
    {
      company: 'Instituto Médico São Paulo',
      details: 'Processo cível em primeira instância',
      date: '08/12/2024',
      value: 120000
    }
  ];

  // Mock data para protestos
  const protests = [
    {
      company: 'Centro Médico Avançado',
      details: 'Protesto de duplicata vencida',
      date: '18/12/2024',
      value: 25000
    },
    {
      company: 'Hospital Regional Norte',
      details: 'Protesto de cheque devolvido',
      date: '14/12/2024',
      value: 15000
    },
    {
      company: 'Clínica Especializada Sul',
      details: 'Protesto de nota promissória',
      date: '10/12/2024',
      value: 35000
    }
  ];

  // Mock data para certidões
  const certificates = [
    {
      company: 'Clínica Popular Centro',
      details: 'Certidão negativa de débitos vencida',
      date: '20/12/2024',
      value: 0
    },
    {
      company: 'Hospital Comunitário',
      details: 'Certidão de regularidade fiscal pendente',
      date: '16/12/2024',
      value: 0
    },
    {
      company: 'Centro de Diagnóstico',
      details: 'Certidão trabalhista em atraso',
      date: '13/12/2024',
      value: 0
    }
  ];

  const formatCurrency = (value) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const sections = [
    {
      title: 'Processos Judiciais',
      icon: Gavel,
      data: legalProcesses,
      iconClass: 'red'
    },
    {
      title: 'Protestos',
      icon: FileWarning,
      data: protests,
      iconClass: 'orange'
    },
    {
      title: 'Certidões',
      icon: FileCheck,
      data: certificates,
      iconClass: 'blue'
    }
  ];

  return (
    <Container>
      <Header>
        <h2>Alertas Externos</h2>
      </Header>

      <GridContainer>
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <AlertCard key={section.title}>
              <CardHeader>
                <h3>{section.title}</h3>
              </CardHeader>
              <AlertList>
                {section.data.map((alert, index) => (
                  <AlertItem key={index}>
                    <AlertContent>
                      <IconContainer className={section.iconClass}>
                        <IconComponent size={16} />
                      </IconContainer>
                      <AlertDetails>
                        <div className="company-name">{alert.company}</div>
                        <div className="alert-description">{alert.details}</div>
                        <div className="alert-date">{alert.date}</div>
                      </AlertDetails>
                    </AlertContent>
                    {alert.value > 0 && (
                      <AlertValue>
                        {formatCurrency(alert.value)}
                      </AlertValue>
                    )}
                  </AlertItem>
                ))}
              </AlertList>
            </AlertCard>
          );
        })}
      </GridContainer>
    </Container>
  );
};

export default AlertasExternos; 