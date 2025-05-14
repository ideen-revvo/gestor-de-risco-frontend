import React, { useState } from 'react'
import styled from 'styled-components'
import { X, CaretRight, CheckCircle, Circle, Clock } from '@phosphor-icons/react'
import { DEFAULT_COMPANY_ID, DEFAULT_USER_ID } from '../constants/defaults'

const Container = styled.div``

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 24px;

  h1 {
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-button {
    color: var(--secondary-text);
    font-size: 14px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0 24px;
  margin-bottom: 24px;
`

const Card = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 16px;
  font-weight: 500;
`

const CardContent = styled.div`
  padding: 16px;
`

const Field = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    color: var(--secondary-text);
    font-size: 13px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 14px;
  }

  &.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`

const OrderItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .name {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .details {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--secondary-text);

    .discount {
      color: var(--success);
    }
  }
`

const Score = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;

  .score {
    .value {
      color: var(--success);
      font-size: 24px;
      font-weight: 600;
    }
    label {
      font-size: 13px;
      color: var(--secondary-text);
    }
  }

  .rating {
    .value {
      font-size: 24px;
      font-weight: 600;
    }
    label {
      font-size: 13px;
      color: var(--secondary-text);
    }
  }
`

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success);
  font-size: 14px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`

const Workflow = styled.div`
  margin: 24px;
`

const WorkflowSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  padding: 0 40px;
  gap: 12px;

  &::before {
    content: '';
    position: absolute;
    left: 56px;
    right: 56px;
    top: 50%;
    height: 2px;
    background: var(--border-color);
    z-index: 0;
  }
`

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border-color);
    color: var(--secondary-text);

    &.completed {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    &.current {
      background: #FCD34D;
      border-color: #FCD34D;
      color: white;
    }
  }

  .label {
    font-size: 13px;
    color: var(--secondary-text);
    text-align: center;
  }
`

const StepDetails = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--background);
  padding: 8px;
`

const StepItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &.current {
    background: #F8F9FA;
    border: 2px solid #2563EB;
  }

  .title {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 13px;
    color: var(--secondary-text);
  }
`

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
`

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 24px;
`

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 16px;
    font-weight: 500;
  }

  button {
    color: var(--secondary-text);
  }
`

const ModalBody = styled.div`
  padding: 16px;
`

const ModalField = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 13px;
    color: var(--secondary-text);
    margin-bottom: 4px;
  }

  .value {
    font-size: 14px;
  }

  textarea {
    width: 100%;
    height: 100px;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    resize: none;
  }
`

const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button.approve {
    background: var(--success);
    color: white;
    border: none;
  }

  button.reject {
    background: var(--error);
    color: white;
    border: none;
  }
`

function OrderDetails({ order, onClose }) {
  const [selectedStep, setSelectedStep] = useState(null)
  const [modalType, setModalType] = useState(null) // 'view' or 'approve'

  const handleStepClick = (step, type) => {
    setSelectedStep(step)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedStep(null)
    setModalType(null)
  }

  return (
    <Container>
      <Header>
        <h1>Ordem de Venda {order.id}</h1>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </Header>

      <Grid>
        <Card>
          <CardHeader>Resumo da Ordem de Vendas</CardHeader>
          <CardContent>
            <Field className="grid">
              <div>
                <label>Data de Criação</label>
                <div className="value">15/03/2024, 07:30:00</div>
              </div>
              <div>
                <label>Última Atualização</label>
                <div className="value">15/03/2024, 07:30:00</div>
              </div>
            </Field>

            <Field>
              <label>ID do Parceiro</label>
              <div className="value">#1001</div>
            </Field>

            <Field>
              <label>Parceiro</label>
              <div className="value">Clínica Estética Bella Vita</div>
            </Field>

            <Field>
              <label>Itens do Pedido</label>
              <OrderItem>
                <div className="name">Implante Mamário Redondo</div>
                <div className="details">
                  <span>2x R$ 2.500,00</span>
                  <span>R$ 4.500,00</span>
                </div>
                <div className="details">
                  <span></span>
                  <span className="discount">Desconto: R$ 500,00</span>
                </div>
              </OrderItem>
              <OrderItem>
                <div className="name">Implante Facial Mentoplastia</div>
                <div className="details">
                  <span>3x R$ 1.800,00</span>
                  <span>R$ 5.200,00</span>
                </div>
                <div className="details">
                  <span></span>
                  <span className="discount">Desconto: R$ 200,00</span>
                </div>
              </OrderItem>
            </Field>

            <Field className="grid">
              <div>
                <label>Total de Itens</label>
                <div className="value">5</div>
              </div>
              <div>
                <label>Valor Total</label>
                <div className="value">R$ 9.700,00</div>
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Análise de Crédito</CardHeader>
          <CardContent>
            <Score>
              <div className="score">
                <div className="value">85</div>
                <label>Score</label>
              </div>
              <div className="rating">
                <div className="value">AA</div>
                <label>Rating</label>
              </div>
            </Score>

            <Field>
              <label>Situação Atual</label>
              <Status>Em dia</Status>
            </Field>

            <Field className="grid">
              <div>
                <label>Status</label>
                <div className="value">Em dia</div>
              </div>
              <div>
                <label>Dias em Atraso (6m)</label>
                <div className="value">0 dias</div>
              </div>
            </Field>

            <Field>
              <label>Limites</label>
              <div className="grid" style={{ marginTop: '8px' }}>
                <div>
                  <label>Limite Total</label>
                  <div className="value">R$ 50.000,00</div>
                </div>
                <div>
                  <label>Disponível</label>
                  <div className="value">R$ 27.100,00</div>
                </div>
              </div>
              <div className="grid" style={{ marginTop: '8px' }}>
                <div>
                  <label>Utilização Atual</label>
                  <div className="value">45.8%</div>
                </div>
                <div>
                  <label>Média Últimos 6m</label>
                  <div className="value">38.5%</div>
                </div>
              </div>
            </Field>

            <Field>
              <label>Histórico de Vendas</label>
              <div style={{ marginTop: '8px' }}>
                <label>Volume últimos 6 meses</label>
                <div className="value">R$ 145.000,00</div>
              </div>
            </Field>
          </CardContent>
        </Card>
      </Grid>

      <Workflow>
        <WorkflowSteps>
          <Step>
            <div className="icon completed">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="label">Analista de crédito</div>
          </Step>
          <Step>
            <div className="icon completed">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="label">Gerente de crédito</div>
          </Step>
          <Step>
            <div className="icon current">
              <Clock size={20} weight="fill" />
            </div>
            <div className="label">Aprovação Comercial</div>
          </Step>
          <Step>
            <div className="icon">
              <Circle size={20} />
            </div>
            <div className="label">Diretor financeiro</div>
          </Step>
        </WorkflowSteps>

        <StepDetails>
          <StepItem onClick={() => handleStepClick('analyst', 'view')}>
            <div className="title">Analista de crédito</div>
            <div className="subtitle">Analista de Crédito</div>
          </StepItem>
          <StepItem onClick={() => handleStepClick('manager', 'view')}>
            <div className="title">Gerente de crédito</div>
            <div className="subtitle">Gerente de Crédito</div>
          </StepItem>
          <StepItem className="current" onClick={() => handleStepClick('commercial', 'approve')}>
            <div className="title">Aprovação Comercial</div>
            <div className="subtitle">Gerente Comercial</div>
          </StepItem>
          <StepItem>
            <div className="title">Diretor financeiro</div>
            <div className="subtitle">Diretor Financeiro</div>
          </StepItem>
        </StepDetails>
      </Workflow>

      {selectedStep && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>
                {modalType === 'view' ? (
                  selectedStep === 'analyst' ? 'Analista de crédito' : 'Gerente de crédito'
                ) : 'Aprovação Comercial'}
              </h2>
              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </ModalHeader>
            
            <ModalBody>
              <ModalField>
                <label>Alçada</label>
                <div className="value">
                  {modalType === 'view' ? (
                    selectedStep === 'analyst' ? 'Analista de Crédito' : 'Gerente de Crédito'
                  ) : 'Gerente Comercial'}
                </div>
              </ModalField>

              {modalType === 'view' && (
                <>
                  <ModalField>
                    <label>Status</label>
                    <div className="value">Aprovado</div>
                  </ModalField>
                  <ModalField>
                    <label>Decisor</label>
                    <div className="value">Maria Silva</div>
                  </ModalField>
                </>
              )}

              <ModalField className="grid">
                <div>
                  <label>Data de Recebimento</label>
                  <div className="value">15/03/2024, {modalType === 'view' ? '07:35' : '09:30'}:00</div>
                </div>
                <div>
                  <label>Prazo</label>
                  <div className="value">15/03/2024, {modalType === 'view' ? '11:35' : '13:30'}:00</div>
                </div>
              </ModalField>

              <ModalField>
                <label>Parecer</label>
                {modalType === 'view' ? (
                  <div className="value">Cliente com bom histórico de pagamentos e limite disponível.</div>
                ) : (
                  <textarea placeholder="Digite seu parecer..." />
                )}
              </ModalField>
            </ModalBody>

            {modalType === 'approve' && (
              <ModalFooter>
                <button className="reject">Rejeitar</button>
                <button className="approve">Aprovar</button>
              </ModalFooter>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  )
}

export default OrderDetails