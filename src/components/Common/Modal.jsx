import React from 'react';
import styled from 'styled-components';
import { X } from '@phosphor-icons/react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text);
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--hover-bg);
      color: var(--primary-text);
    }
  }
`;

const Modal = ({ isOpen = true, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </ModalHeader>
        {children}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;