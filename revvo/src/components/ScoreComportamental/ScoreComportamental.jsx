import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, BarChart3, TrendingUp, Users } from 'lucide-react';
import { ModelDetails } from './ModelDetails';
import { ModelComparison } from './ModelComparison';
import { ModelEditModal } from './ModelEditModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { apiService } from '../../services/api.js';

const Container = styled.div`
  
width: 100vw;
  max-width: 80vw;
  margin: 0;
  padding: 24px 16px ;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  width: 100%;

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .new-model-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    &:hover {
      filter: brightness(1.1);
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #F8F9FA;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
`;

const Tab = styled.button`
  flex: 1;
  padding: 0px 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-text);
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  &.active {
    background: white;
    color: var(--primary-blue);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-weight: 600;
  }

  &:hover:not(.active) {
    color: var(--primary-text);
    background: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  width: 100%;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .stat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 112, 242, 0.1);
      color: var(--primary-blue);
    }

    .title {
      font-size: 14px;
      color: var(--secondary-text);
      font-weight: 500;
    }
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
    margin-bottom: 4px;
  }

  .stat-subtitle {
    font-size: 12px;
    color: var(--secondary-text);
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 400px;
  width: 100%;
  min-width: 0;
`;

// Mock data
const mockChampionModel = {
  name: 'Modelo Champion',
  description: 'Modelo principal em produção para avaliação de crédito',
  variables: [
    { name: 'Idade', weight: 0.15, score: 75 },
    { name: 'Renda', weight: 0.20, score: 82 },
    { name: 'Histórico de Crédito', weight: 0.15, score: 90 },
    { name: 'Tempo de Emprego', weight: 0.10, score: 65 },
    { name: 'Quantidade de Empréstimos', weight: 0.08, score: 78 },
    { name: 'Taxa de Utilização de Crédito', weight: 0.12, score: 85 },
    { name: 'Pagamentos em Dia', weight: 0.10, score: 92 },
    { name: 'Consultas Recentes', weight: 0.05, score: 70 },
    { name: 'Mix de Crédito', weight: 0.03, score: 88 },
    { name: 'Tempo de Relacionamento', weight: 0.02, score: 95 },
  ],
  finalScore: 82.1,
  ksScore: 65.5,
  distributionData: [
    { score: 300, goodCumulative: 0.1, badCumulative: 0.3 },
    { score: 400, goodCumulative: 0.2, badCumulative: 0.5 },
    { score: 500, goodCumulative: 0.4, badCumulative: 0.7 },
    { score: 600, goodCumulative: 0.6, badCumulative: 0.8 },
    { score: 700, goodCumulative: 0.8, badCumulative: 0.9 },
    { score: 800, goodCumulative: 1.0, badCumulative: 1.0 },
  ],
};

const mockChallengerModel = {
  name: 'Modelo Challenger',
  description: 'Modelo candidato para substituição do modelo champion',
  variables: [
    { name: 'Idade', weight: 0.12, score: 78 },
    { name: 'Renda', weight: 0.22, score: 85 },
    { name: 'Histórico de Crédito', weight: 0.15, score: 88 },
    { name: 'Tempo de Emprego', weight: 0.12, score: 72 },
    { name: 'Quantidade de Empréstimos', weight: 0.07, score: 80 },
    { name: 'Taxa de Utilização de Crédito', weight: 0.13, score: 87 },
    { name: 'Pagamentos em Dia', weight: 0.09, score: 94 },
    { name: 'Consultas Recentes', weight: 0.06, score: 75 },
    { name: 'Mix de Crédito', weight: 0.02, score: 90 },
    { name: 'Tempo de Relacionamento', weight: 0.02, score: 96 },
  ],
  finalScore: 84.2,
  ksScore: 68.2,
  distributionData: [
    { score: 300, goodCumulative: 0.05, badCumulative: 0.35 },
    { score: 400, goodCumulative: 0.15, badCumulative: 0.55 },
    { score: 500, goodCumulative: 0.35, badCumulative: 0.75 },
    { score: 600, goodCumulative: 0.65, badCumulative: 0.85 },
    { score: 700, goodCumulative: 0.85, badCumulative: 0.95 },
    { score: 800, goodCumulative: 1.0, badCumulative: 1.0 },
  ],
};

export function ScoreComportamental() {
  const [activeTab, setActiveTab] = useState('champion');
  const [isNewModelModalOpen, setIsNewModelModalOpen] = useState(false);
  const [championModel, setChampionModel] = useState(mockChampionModel);
  const [challengerModel, setChallengerModel] = useState(mockChallengerModel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewModel = async (newModel) => {
    setLoading(true);
    setError(null);
    try {
      const [insertedModel] = await apiService.supabaseInsert('score_models', [{
        name: newModel.name,
        description: newModel.description,
        frequencia_calculo: newModel.frequenciaCalculo,
        model_type: newModel.modelType,
        final_score: newModel.finalScore,
        ks_score: newModel.ksScore
      }]);
      if (insertedModel && newModel.variables && newModel.variables.length > 0) {
        const variablesToInsert = newModel.variables.map(v => ({
          model_id: insertedModel.id,
          name: v.name,
          weight: v.weight,
          score: v.score ?? null
        }));
        await apiService.supabaseInsert('score_model_variables', variablesToInsert);
      }
      setIsNewModelModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar modelo: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChampion = (updatedModel) => {
    setChampionModel(updatedModel);
  };

  const handleUpdateChallenger = (updatedModel) => {
    setChallengerModel(updatedModel);
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    switch (activeTab) {
      case 'champion':
        return (
          <ModelDetails
            data={championModel}
            title="Modelo Champion"
            onUpdate={handleUpdateChampion}
          />
        );
      case 'challenger':
        return (
          <ModelDetails
            data={challengerModel}
            title="Modelo Challenger"
            onUpdate={handleUpdateChallenger}
          />
        );
      case 'comparison':
        return (
          <ModelComparison
            champion={championModel}
            challenger={challengerModel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <h1>Score Comportamental</h1>
        <div className="header-actions">
          <button
            className="new-model-button"
            onClick={() => setIsNewModelModalOpen(true)}
          >
            <Plus size={16} />
            Novo Modelo
          </button>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <BarChart3 size={20} />
            </div>
            <div className="title">KS Score Champion</div>
          </div>
          <div className="stat-value">{championModel.ksScore}%</div>
          <div className="stat-subtitle">Poder discriminatório</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <TrendingUp size={20} />
            </div>
            <div className="title">KS Score Challenger</div>
          </div>
          <div className="stat-value">{challengerModel.ksScore}%</div>
          <div className="stat-subtitle">Modelo em teste</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <Users size={20} />
            </div>
            <div className="title">Melhoria</div>
          </div>
          <div className="stat-value">
            +{(challengerModel.ksScore - championModel.ksScore).toFixed(1)}%
          </div>
          <div className="stat-subtitle">Challenger vs Champion</div>
        </StatCard>
      </StatsGrid>

      <TabContainer>
        <Tab
          className={activeTab === 'champion' ? 'active' : ''}
          onClick={() => setActiveTab('champion')}
        >
          Modelo Champion
        </Tab>
        <Tab
          className={activeTab === 'challenger' ? 'active' : ''}
          onClick={() => setActiveTab('challenger')}
        >
          Modelo Challenger
        </Tab>
        <Tab
          className={activeTab === 'comparison' ? 'active' : ''}
          onClick={() => setActiveTab('comparison')}
        >
          Comparativo
        </Tab>
      </TabContainer>

      <ContentArea>
        {renderContent()}
      </ContentArea>

      <ModelEditModal
        isOpen={isNewModelModalOpen}
        onClose={() => setIsNewModelModalOpen(false)}
        onSave={handleNewModel}
      />
    </Container>
  );
}

export default ScoreComportamental;