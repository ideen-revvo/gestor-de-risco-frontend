import { supabase } from '../lib/supabase';

// Lista regras de workflow da empresa
export async function listWorkflowRules(companyId) {
  const { data, error } = await supabase
    .from('workflow_rules')
    .select(`
      *,
      workflow_type:type_id(id, name),
      user_role:role_id(id, name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Cria uma nova regra de workflow
export async function createWorkflowRule(ruleData) {
  const { error } = await supabase
    .from('workflow_rules')
    .insert([ruleData]);
  if (error) throw error;
  return true;
}

// Atualiza uma regra de workflow
export async function updateWorkflowRule(id, ruleData) {
  const { error } = await supabase
    .from('workflow_rules')
    .update(ruleData)
    .eq('id', id);
  if (error) throw error;
  return true;
}

// Deleta uma regra de workflow
export async function deleteWorkflowRule(id) {
  const { error } = await supabase
    .from('workflow_rules')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
} 