import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { getGlobalCompanyId } from '../../lib/globalState';
import { X } from '@phosphor-icons/react';
import { getCompanyById, updateCompany, createCompany, updateAddress, createAddress } from '../../services/companyService';

const Container = styled.div`
  max-width: 800px;
  margin: 32px auto;
  padding: 0 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-text);
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text);
    transition: all 0.2s ease;
    
    &:hover {
      color: var(--primary-text);
      transform: scale(1.1);
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-section {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text);
    margin-bottom: 16px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text);
    }

    input, select {
      height: 40px;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 12px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-blue);
      }

      &:disabled {
        background: #f8f9fa;
        cursor: not-allowed;
      }
    }

    .error {
      color: var(--error);
      font-size: 12px;
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      height: 40px;
      
      &.cancel {
        background: white;
        border: 1px solid var(--border-color);
        color: var(--secondary-text);
        
        &:hover {
          background: var(--background);
        }
      }
      
      &.save {
        background: var(--primary-blue);
        border: none;
        color: white;
        
        &:hover {
          filter: brightness(1.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
`;

const CompanyProfile = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    id: null,
    name: '',
    doc_num: '',
    income_yr: '',
    employees_num: '',
    income_level: '',
    company_code: '',
    address_id: null,
    address: {
      street: '',
      num: '',
      compl: '',
      zcode: '',
      county: '',
      city: '',
      state: '',
      Country: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadCompany() {
      try {
        const companyId = getGlobalCompanyId();
        if (!companyId) return;
        const companyData = await getCompanyById(companyId);
        if (companyData) {
          const companyObj = {
            id: companyData.id,
            name: companyData.name || '',
            doc_num: companyData.doc_num || '',
            income_yr: companyData.income_yr || '',
            employees_num: companyData.employees_num || '',
            income_level: companyData.income_level || '',
            company_code: companyData.company_code || '',
            address_id: companyData.address_id || null,
            address: companyData.address || {
              id: null,
              street: '',
              num: '',
              compl: '',
              zcode: '',
              county: '',
              city: '',
              state: '',
              Country: ''
            }
          };
          setCompany(companyObj);
        }
      } catch (error) {
        console.error('Error loading company:', error.message);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!company.name) newErrors.name = 'Nome é obrigatório';
    if (!company.doc_num) newErrors.doc_num = 'CNPJ é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (company.address_id) {
        await updateAddress(company.address_id, company.address);
      } else {
        const address = await createAddress(company.address);
        company.address_id = address.id;
      }
      if (company.id) {
        await updateCompany(company.id, {
          name: company.name,
          doc_num: company.doc_num,
          income_yr: company.income_yr,
          employees_num: company.employees_num,
          income_level: company.income_level,
          company_code: company.company_code,
          address_id: company.address_id
        });
      } else {
        await createCompany({
          name: company.name,
          doc_num: company.doc_num,
          income_yr: company.income_yr,
          employees_num: company.employees_num,
          income_level: company.income_level,
          company_code: company.company_code,
          address_id: company.address_id
        });
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving company:', error.message);
      alert('Erro ao salvar empresa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            Carregando...
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>Dados da Empresa</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </Header>

      <Card>
        <Form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-title">Identificação</div>
            <div className="form-row">
              <div className="form-group">
                <label>Razão Social</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => {
                    setCompany({ ...company, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Digite a razão social"
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  value={company.doc_num}
                  onChange={(e) => {
                    setCompany({ ...company, doc_num: e.target.value });
                    if (errors.doc_num) setErrors({ ...errors, doc_num: '' });
                  }}
                  placeholder="Digite o CNPJ"
                />
                {errors.doc_num && <span className="error">{errors.doc_num}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">Endereço</div>
            <div className="form-row">
              <div className="form-group">
                <label>Logradouro</label>
                <input
                  type="text"
                  value={company.address.street}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, street: e.target.value } })}
                  placeholder="Digite o logradouro"
                />
              </div>

              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  value={company.address.num}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, num: e.target.value } })}
                  placeholder="Digite o número"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  value={company.address.compl}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, compl: e.target.value } })}
                  placeholder="Digite o complemento"
                />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={company.address.zcode}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, zcode: e.target.value } })}
                  placeholder="Digite o CEP"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={company.address.county}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, county: e.target.value } })}
                  placeholder="Digite o bairro"
                />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={company.address.city}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, city: e.target.value } })}
                  placeholder="Digite a cidade"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  value={company.address.state}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, state: e.target.value } })}
                  placeholder="Digite o estado"
                />
              </div>

              <div className="form-group">
                <label>País</label>
                <input
                  type="text"
                  value={company.address.Country}
                  onChange={(e) => setCompany({ ...company, address: { ...company.address, Country: e.target.value } })}
                  placeholder="Digite o país"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">Dados Adicionais</div>
            <div className="form-row">
              <div className="form-group">
                <label>Faturamento Anual (R$)</label>
                <input
                  type="number"
                  value={company.income_yr}
                  onChange={(e) => setCompany({ ...company, income_yr: e.target.value })}
                  placeholder="Digite o faturamento anual"
                  step="0.01"
                />
              </div>

              <div className="form-group">
              <label>Código da Empresa</label>
              <input
                type="text"
                value={company.company_code}
                onChange={(e) => setCompany({ ...company, company_code: e.target.value })}
                placeholder="Digite o código da empresa"
              />
            </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Número de Funcionários</label>
                <input
                  type="number"
                  value={company.employees_num}
                  onChange={(e) => setCompany({ ...company, employees_num: e.target.value })}
                  placeholder="Digite o número de funcionários"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Nível de Renda</label>
                <select
                  value={company.income_level}
                  onChange={(e) => setCompany({ ...company, income_level: e.target.value })}
                >
                  <option value="">Selecione o nível de renda</option>
                  <option value="1">Baixa</option>
                  <option value="2">Média</option>
                  <option value="3">Alta</option>
                </select>
              </div>
            </div>

            
          </div>

          <div className="buttons">
            {onClose && (
              <button type="button" className="cancel" onClick={onClose}>
                Cancelar
              </button>
            )}
            <button type="submit" className="save" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default CompanyProfile;