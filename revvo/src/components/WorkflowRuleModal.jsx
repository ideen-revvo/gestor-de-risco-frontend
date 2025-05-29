import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getGlobalCompanyId } from '../lib/globalState';

const WorkflowRuleModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [workflowTypes, setWorkflowTypes] = useState([]);

  const initialFormData = {
    nome: '',
    descriptions: '',
    value_range: [0, 0],
    company_id: getGlobalCompanyId(),
    role_id: null,
    type_id: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      loadWorkflowTypes();
      setIsEditing(true);
      if (initialData) {
        setFormData({
          nome: initialData.nome || '',
          descriptions: initialData.descriptions || '',
          value_range: initialData.value_range || [0, 0],
          company_id: initialData.company_id || getGlobalCompanyId(),
          role_id: initialData.role_id || null,
          type_id: initialData.type_id || null
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, initialData]);

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role')
        .select('id, name')
        .eq('company_id', getGlobalCompanyId())
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadWorkflowTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_type')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setWorkflowTypes(data || []);
    } catch (error) {
      console.error('Error loading workflow types:', error);
    }
  };
  // Função utilitária para formatar como moeda BRL
  function formatCurrency(value) {
    // If the value is null or undefined, return empty string
    if (value == null) return '';
    // Ensure the value is treated as a number
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseCurrency(formatted) {
    // Handle both string and number inputs and remove all non-digits
    const valueStr = String(formatted).replace(/[^\d]/g, '');
    // If the cleaned string is empty, return 0
    if (valueStr === '') return 0;

    // Convert the digit string to a number and treat the last two digits as decimals
    const num = parseInt(valueStr, 10) / 100;

    // Return 0 if the result is NaN (shouldn't happen with valid digit strings)
    return isNaN(num) ? 0 : num;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error saving workflow rule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[10vh]">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">
            {initialData ? 'Editar Regra de Workflow' : 'Nova Regra de Workflow'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descriptions}
                  onChange={(e) => setFormData({ ...formData, descriptions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Workflow
                </label>
                <select
                  value={formData.type_id || ''}
                  onChange={(e) => setFormData({ ...formData, type_id: Number(e.target.value) })}
                  className="w-full px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {workflowTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faixa de Valores
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formatCurrency(formData.value_range[0])}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        // Treat the raw digits, assuming the last two are decimals
                        const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10) / 100;
                        setFormData({
                          ...formData,
                          value_range: [numValue, formData.value_range[1]]
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor mínimo"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formatCurrency(formData.value_range[1])}
                      onChange={(e) => {
                         const rawValue = e.target.value.replace(/[^\d]/g, '');
                         // Treat the raw digits, assuming the last two are decimals
                         const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10) / 100;
                         setFormData({
                          ...formData,
                          value_range: [formData.value_range[0], numValue]
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor máximo"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Papel
                </label>
                <select
                  value={formData.role_id || ''}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um papel</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t mt-6">
              <div className="flex gap-3 w-full justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(initialFormData);
                    onClose();
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center min-w-[100px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkflowRuleModal;