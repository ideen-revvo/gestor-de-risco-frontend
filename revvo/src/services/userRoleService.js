import { supabase } from '../lib/supabase';

// Lista roles da empresa
export async function listRoles(companyId) {
  const { data, error } = await supabase
    .from('user_role')
    .select('id, name, description')
    .eq('company_id', companyId)
    .order('name');
  if (error) throw error;
  return data;
}

// Cria uma nova role
export async function createRole(roleData) {
  const { error } = await supabase
    .from('user_role')
    .insert([roleData]);
  if (error) throw error;
  return true;
}

// Busca o nome da role pelo id
export async function getRoleNameById(roleId) {
  const { data, error } = await supabase
    .from('user_role')
    .select('name')
    .eq('id', roleId)
    .single();
  if (error) throw error;
  return data?.name || '';
} 