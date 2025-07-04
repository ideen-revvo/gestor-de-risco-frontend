import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import styled from 'styled-components';
import { Table } from './Table';
import { KSChart } from './KSChart';
import { ModelEditModal } from './ModelEditModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }

  .edit-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    color: var(--primary-blue);
    border: 1px solid var(--primary-blue);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 112, 242, 0.05);
    }
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0 0 16px 0;
  }

  .score-display {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    p {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text);
      margin: 0;

      span {
        color: var(--primary-blue);
        font-size: 18px;
      }
    }
  }
`;

export function ModelDetails({ data, title, onUpdate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSave = (updatedModel) => {
    onUpdate?.(updatedModel);
    setIsEditModalOpen(false);
  };

  return (
    <Container>
      <Header>
        <h2>{title}</h2>
        <button
          className="edit-button"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Edit2 size={16} />
          Editar Modelo
        </button>
      </Header>
      
      <ModelEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        model={data}
        onSave={handleSave}
      />
      
      <GridContainer>
        <Card>
          <h3>Variáveis e Pesos</h3>
          <Table
            data={data.variables}
            columns={[
              { header: 'Variável', accessor: 'name' },
              { header: 'Peso', accessor: 'weight' },
              { header: 'Pontuação', accessor: 'score' },
            ]}
          />
          <div className="score-display">
            <p>
              Pontuação Final: <span>{data.finalScore.toFixed(1)}</span>
            </p>
          </div>
        </Card>

        <Card>
          <h3>Distribuição KS</h3>
          <KSChart data={data.distributionData} />
          <div className="score-display">
            <p>
              Pontuação KS: <span>{data.ksScore}%</span>
            </p>
          </div>
        </Card>
      </GridContainer>
    </Container>
  );
}