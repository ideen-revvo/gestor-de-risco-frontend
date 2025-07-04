import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import styled from 'styled-components';
import { Table } from './Table';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
`;

const ComparisonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .metric {
    font-size: 16px;
    color: var(--primary-text);

    span {
      font-weight: 600;
    }
  }

  .difference {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;

    &.positive {
      color: var(--success);
    }

    &.negative {
      color: var(--error);
    }
  }
`;

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
`;

export function ModelComparison({ champion, challenger }) {
  const ksDiff = challenger.ksScore - champion.ksScore;
  const scoreDiff = challenger.finalScore - champion.finalScore;

  const comparisonData = champion.variables.map((championVar, index) => {
    const challengerVar = challenger.variables[index];
    return {
      variable: championVar.name,
      championWeight: championVar.weight,
      challengerWeight: challengerVar.weight,
      championScore: championVar.score,
      challengerScore: challengerVar.score,
    };
  });

  return (
    <Container>
      <GridContainer>
        <Card>
          <h3>Comparativo da Pontuação KS</h3>
          <ComparisonRow>
            <div className="metric">
              Champion: <span>{champion.ksScore}%</span>
            </div>
            <div className="metric">
              Challenger: <span>{challenger.ksScore}%</span>
            </div>
            <div className={`difference ${ksDiff > 0 ? 'positive' : 'negative'}`}>
              {ksDiff > 0 ? (
                <ArrowUpIcon size={20} />
              ) : (
                <ArrowDownIcon size={20} />
              )}
              <span>{Math.abs(ksDiff).toFixed(2)}%</span>
            </div>
          </ComparisonRow>
        </Card>

        <Card>
          <h3>Comparativo da Pontuação Final</h3>
          <ComparisonRow>
            <div className="metric">
              Champion: <span>{champion.finalScore.toFixed(1)}</span>
            </div>
            <div className="metric">
              Challenger: <span>{challenger.finalScore.toFixed(1)}</span>
            </div>
            <div className={`difference ${scoreDiff > 0 ? 'positive' : 'negative'}`}>
              {scoreDiff > 0 ? (
                <ArrowUpIcon size={20} />
              ) : (
                <ArrowDownIcon size={20} />
              )}
              <span>{Math.abs(scoreDiff).toFixed(2)}</span>
            </div>
          </ComparisonRow>
        </Card>
      </GridContainer>

      <FullWidthCard>
        <h3>Comparativo Detalhado</h3>
        <Table
          data={comparisonData}
          columns={[
            { header: 'Variável', accessor: 'variable' },
            { header: 'Peso Champion', accessor: 'championWeight' },
            { header: 'Peso Challenger', accessor: 'challengerWeight' },
            { header: 'Score Champion', accessor: 'championScore' },
            { header: 'Score Challenger', accessor: 'challengerScore' },
          ]}
        />
      </FullWidthCard>
    </Container>
  );
}