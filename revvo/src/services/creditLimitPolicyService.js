import { supabase } from '../lib/supabase';

// Lista políticas de limite de crédito da empresa
export async function listCreditLimitPolicies(companyId) {
  const { data, error } = await supabase
    .from('credit_limit_policies')
    .select('*')
    .eq('company_id', companyId)
    .order('min_amount', { ascending: true });
  if (error) throw error;
  return data;
}

// Cria uma nova política
export async function createCreditLimitPolicy(policyData) {
  const { error } = await supabase
    .from('credit_limit_policies')
    .insert([policyData]);
  if (error) throw error;
  return true;
}

// Atualiza uma política
export async function updateCreditLimitPolicy(id, policyData) {
  const { error } = await supabase
    .from('credit_limit_policies')
    .update(policyData)
    .eq('id', id);
  if (error) throw error;
  return true;
}

// Deleta uma política
export async function deleteCreditLimitPolicy(id) {
  const { error } = await supabase
    .from('credit_limit_policies')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
} 