import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getGlobalCompanyId } from '../lib/globalState';
import WorkflowRuleModal from './WorkflowRuleModal';
import UserRoleModal from './UserRoleModal';

const WorkflowRules = () => {
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select(`
          *,
          workflow_type:type_id (
            id,
            name
          )
        `)
        .eq('company_id', getGlobalCompanyId())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading workflow rules:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('workflow_rules')
        .insert([
          {
            nome: formData.nome,
            descriptions: formData.descriptions,
            value_range: [formData.amt_1, formData.amt_2],
            role_id: formData.role_id,
            company_id: getGlobalCompanyId(),
            type_id: formData.type_id
          }
        ]);

      if (error) throw error;
      await loadRules();
      setIsWorkflowModalOpen(false);
    } catch (error) {
      console.error('Error saving workflow rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="h-full">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Regras de Workflow</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-end gap-4 mb-6">
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Novo Cargo
              </button>
              <button 
                onClick={() => setIsWorkflowModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Nova Regra
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-4 p-4 border-b border-gray-200">
                <div className="font-medium text-sm text-gray-600">Nome</div>
                <div className="font-medium text-sm text-gray-600">Descrição</div>
                <div className="font-medium text-sm text-gray-600">Faixa de Valores</div>
                <div className="font-medium text-sm text-gray-600">Papéis</div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Carregando...
                  </div>
                ) : rules.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma regra cadastrada
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-4 items-center">
                        <div className="text-sm">{rule.nome}</div>
                        <div className="text-sm">{rule.descriptions}</div>
                        <div className="text-sm">
                          {rule.value_range && rule.value_range.length === 2 && (
                            <>
                              {formatCurrency(rule.value_range[0])} - {formatCurrency(rule.value_range[1])}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rule.role_id && rule.role_id.map((role, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <WorkflowRuleModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          onSave={handleSave}
        />

        <UserRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSave={() => {
            setIsRoleModalOpen(false);
            // You might want to refresh the roles list here if needed
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowRules;