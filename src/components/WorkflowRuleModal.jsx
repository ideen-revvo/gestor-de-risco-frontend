import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const WorkflowRuleModal = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [roles] = useState([
    { id: 1, name: 'Papel 1' },
    { id: 2, name: 'Papel 2' },
    { id: 3, name: 'Papel 3' },
    { id: 4, name: 'Papel 4' }
  ]);

  const initialFormData = {
    nome: '',
    descriptions: '',
    amt_1: [0, 0],
    role_id: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(true);
      setFormData(initialFormData);
    }
  }, [isOpen]);

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

        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Regra
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-5 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Ex: Aprovação até 100k"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={formData.descriptions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptions: e.target.value }))} 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descreva o fluxo de aprovação..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Valor Mínimo de Pagamento
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(formData.amt_1[0])}
                    onChange={(e) => {
                      const value = parseCurrency(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        amt_1: [value, prev.amt_1[1]]
                      }));
                    }}
                    className="block w-full pl-8 pr-3 py-4 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Valor Máximo de Pagamento
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(formData.amt_1[1])}
                    onChange={(e) => {
                      const value = parseCurrency(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        amt_1: [prev.amt_1[0], value]
                      }));
                    }}
                    className="block w-full pl-8 pr-3 py-4 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Papéis de Aprovação</h4>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    role_id: [...(prev.role_id || []), ""]
                  }))}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Papel
                </button>
              </div>

              <div className="space-y-4">
                {formData.role_id.map((roleId, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-1">
                      <div>
                        <select
                          value={roleId}
                          onChange={(e) => {
                            const newRoleIds = [...formData.role_id];
                            newRoleIds[index] = Number(e.target.value);
                            setFormData(prev => ({ ...prev, role_id: newRoleIds }));
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-0 focus:ring-blue-500 focus:border-blue-500 text-base"
                          required
                        >
                          <option value="" disabled>Selecione um papel</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.role_id.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newRoleIds = [...formData.role_id];
                          newRoleIds.splice(index, 1);
                          setFormData(prev => ({ ...prev, role_id: newRoleIds }));
                        }}
                        className="mt-8 text-gray-400 hover:text-gray-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
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