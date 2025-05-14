import React from 'react';
import styled from 'styled-components';
import { X } from '@phosphor-icons/react';

const Header = styled.header`
  margin-bottom: 24px;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
  }

  .company-name {
    font-size: 16px;
    color: var(--secondary-text);
    margin-top: 4px;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text);
    display: flex;
    align-items: center;
    height: 26px;
    
    &:hover {
      color: var(--primary-text);
      transform: scale(1.1);
    }
  }
`;

const DashboardHeader = ({ companyName }) => {
  return (
    <Header>
      <div className="title-row">
        <h2>Análise Solicitação de Limite</h2>
        <button 
          className="close-button" 
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToInbox'))}
        >
          <X size={20} weight="bold" />
        </button>
      </div>
      {companyName && (
        <div className="company-name">{companyName}</div>
      )}
    </Header>
  );
};

export default DashboardHeader;