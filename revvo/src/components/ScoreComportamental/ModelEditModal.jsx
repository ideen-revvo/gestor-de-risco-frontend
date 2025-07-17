import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
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
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--primary-text);
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text);
    
    &:hover {
      color: var(--primary-text);
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text);
    margin-bottom: 8px;
  }

  input, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 2px rgba(0, 112, 242, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 2px rgba(0, 112, 242, 0.1);
    }
  }
`;

const VariableCard = styled.div`
  background: #F8F9FA;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);

  .variable-row {
    display: grid;
    grid-template-columns: 1fr 120px 120px 40px;
    gap: 16px;
    align-items: end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  .delete-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: var(--error);
    border-radius: 4px;
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-top: 1px solid var(--border-color);
  gap: 12px;

  .add-button {
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
    
    &:hover {
      background: rgba(0, 112, 242, 0.05);
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .cancel-button {
    padding: 0px 16px;
    background: white;
    color: var(--secondary-text);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      background: #F8F9FA;
    }
  }

  .save-button {
    padding: 0px 16px;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      filter: brightness(1.1);
    }
  }
`;

export function ModelEditModal({ isOpen, onClose, model, onSave }) {
  const [formData, setFormData] = useState(model || {
    name: '',
    description: '',
    frequenciaCalculo: '', // ADICIONADO
    modelType: 'scorecard', // Default to scorecard
    variables: [],
    finalScore: 0,
    ksScore: 0,
    distributionData: [],
    target_nome: '',
    target_operador: '>',
    target_valor: ''
  });

  const [variables, setVariables] = useState(model?.variables || []);
  const [modelType, setModelType] = useState(model?.modelType || 'scorecard');
  // Estado para variável target
  const [target, setTarget] = useState({
    nome: model?.target_nome || '',
    operador: model?.target_operador || '>',
    valor: model?.target_valor || ''
  });

  const handleAddVariable = () => {
    const newVariable = modelType === 'scorecard' 
      ? { name: '', weight: 0, score: 0 }
      : { name: '', weight: 0 }; // Score Linear Ponderado only has weight
    
    setVariables([
      ...variables,
      newVariable
    ]);
  };

  const handleDeleteVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = variables.map((variable, i) => {
      if (i === index) {
        return {
          ...variable,
          [field]: field === 'name' ? value : parseFloat(value) || 0
        };
      }
      return variable;
    });
    setVariables(updatedVariables);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetChange = (field, value) => {
    setTarget(prev => ({ ...prev, [field]: value }));
  };

  const handleModelTypeChange = (type) => {
    setModelType(type);
    setFormData(prev => ({ ...prev, modelType: type }));
    
    // Reset variables when changing model type
    if (type === 'scorecard') {
      setVariables(variables.map(v => ({ ...v, score: v.score || 0 })));
    } else {
      // Remove score field for Score Linear Ponderado
      setVariables(variables.map(v => {
        const { score, ...rest } = v;
        return rest;
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let processedVariables = variables;
    let finalScore = 0;
    // Converter peso de % para decimal
    processedVariables = variables.map(v => ({
      ...v,
      weight: v.weight > 1 ? v.weight / 100 : v.weight
    }));
    if (modelType === 'scorecard') {
      // Normalize weights to sum to 1 for scorecard
      const totalWeight = processedVariables.reduce((sum, v) => sum + Math.abs(v.weight), 0);
      processedVariables = processedVariables.map(v => ({
        ...v,
        weight: totalWeight > 0 ? v.weight / totalWeight : 0
      }));
      // Calculate final score for scorecard
      finalScore = processedVariables.reduce(
        (sum, v) => sum + v.weight * (v.score || 0),
        0
      );
    } else {
      // For Score Linear Ponderado, don't normalize weights and calculate differently
      finalScore = processedVariables.reduce((sum, v) => sum + v.weight, 0);
    }
    // Create mock KS distribution data for new models
    const mockDistributionData = !model ? [
      { score: 300, goodCumulative: 0.1, badCumulative: 0.3 },
      { score: 500, goodCumulative: 0.5, badCumulative: 0.7 },
      { score: 800, goodCumulative: 1.0, badCumulative: 1.0 },
    ] : model.distributionData;
    onSave({
      ...formData,
      variables: processedVariables,
      finalScore,
      ksScore: model?.ksScore || 60.0,
      distributionData: mockDistributionData,
      target_nome: target.nome,
      target_operador: target.operador,
      target_valor: target.valor
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{model ? 'Editar Modelo' : 'Novo Modelo'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <label>Nome do Modelo</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Descrição</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
            <label style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--primary-text)',
                marginBottom: '8px',
                display: 'block'
              }}>
                Frequência de Cálculo
              </label>
              <select
                value={formData.frequenciaCalculo || ''}
                onChange={e => handleInputChange('frequenciaCalculo', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: 'var(--primary-text)',
                  height: 'auto'
                }}
              >
                <option value="" disabled>Selecione...</option>
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
                <option value="manual">Manual (por solicitação do usuário)</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--primary-text)',
                marginBottom: '8px',
                display: 'block'
              }}>
                Tipo de Modelo
              </label>
              <select
                value={modelType}
                onChange={(e) => handleModelTypeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: 'var(--primary-text)',
                  height: 'auto'
                }}
              >
                <option value="scorecard">Scorecard</option>
                <option value="score_linear_ponderado">Score Linear Ponderado</option>
              </select>
            </FormGroup>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary-text)' }}>
                Variáveis do Modelo
              </h3>
              {/* Novo container para variável target */}
              <VariableCard>
                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary-text)' }}>Variável Target</h2>
                <div className="variable-row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: 16, alignItems: 'end' }}>
                  <FormGroup style={{ marginBottom: 0 }}>
                    <label>Nome da Variável</label>
                    <input type="text" placeholder="Nome da variável" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                      value={target.nome}
                      onChange={e => handleTargetChange('nome', e.target.value)}
                    />
                  </FormGroup>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
                    <FormGroup style={{ marginBottom: 0 }}>
                      <label>Operador</label>
                      <select style={{ padding: 0, borderRadius: 4, border: '1px solid #ccc', width: 70 }}
                        value={target.operador}
                        onChange={e => handleTargetChange('operador', e.target.value)}
                      >
                        <option value=">">&gt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="=">=</option>
                        <option value="<=">&lt;=</option>
                        <option value="<">&lt;</option>
                      </select>
                    </FormGroup>
                    <FormGroup style={{ marginBottom: 0, flex: 2 }}>
                      <label>Valor</label>
                      <input type="number" placeholder="Valor" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 80 }}
                        value={target.valor}
                        onChange={e => handleTargetChange('valor', e.target.value)}
                      />
                    </FormGroup>
                  </div>
                </div>
              </VariableCard>

              {variables.map((variable, index) => (
                <VariableCard key={index}>
                  <div className="variable-row" style={{
                    gridTemplateColumns: modelType === 'scorecard' 
                      ? '1fr 120px 120px 40px' 
                      : '1fr 120px 40px'
                  }}>
                    <FormGroup style={{ marginBottom: 0 }}>
                      <label>Nome da Variável</label>
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: 0 }}>
                      <label>Peso</label>
                      <input
                        type="number"
                        value={variable.weight}
                        onChange={(e) => handleVariableChange(index, 'weight', e.target.value)}
                        step="0.01"
                        required
                      />
                    </FormGroup>
                    {modelType === 'scorecard' && (
                      <FormGroup style={{ marginBottom: 0 }}>
                      <label>Pontuação</label>
                      <input
                        type="number"
                        value={variable.score}
                        onChange={(e) => handleVariableChange(index, 'score', e.target.value)}
                        min="0"
                        max="100"
                        required
                      />
                      </FormGroup>
                    )}
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteVariable(index)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </VariableCard>
              ))}
            </div>
          </ModalBody>

          <ButtonGroup>
            <button
              type="button"
              className="add-button"
              onClick={handleAddVariable}
            >
              <Plus size={16} />
              Adicionar Variável
            </button>

            <div className="action-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="save-button"
              >
                Salvar Alterações
              </button>
            </div>
          </ButtonGroup>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
}