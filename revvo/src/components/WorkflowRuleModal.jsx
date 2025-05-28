import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WorkflowRuleModal = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [workflowTypes, setWorkflowTypes] = useState([]);

  const initialFormData = {
    nome: '',
    descriptions: '',
    amt_1: [0, 0],
    amt_2: [0, 0],
    role_id: [],
    type_id: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      loadWorkflowTypes();
      setIsEditing(true);
      setFormData(initialFormData);
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role')
        .select('id, name')
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrency = (value) => {
    return Number(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
  };

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
          <h2 className="text-lg font-medium">Regras de Workflow</h2>
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
                      value={formatCurrency(formData.amt_1[0])}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setFormData({
                          ...formData,
                          amt_1: [value, formData.amt_1[1]]
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor mínimo"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formatCurrency(formData.amt_1[1])}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setFormData({
                          ...formData,
                          amt_1: [formData.amt_1[0], value]
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
                  Papéis
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.role_id.includes(role.id)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...formData.role_id, role.id]
                            : formData.role_id.filter((id) => id !== role.id);
                          setFormData({ ...formData, role_id: newRoles });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{role.name}</span>
                    </label>
                  ))}
                </div>
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
                  {loading ? 'Salvando...' : 'Salvar'}
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