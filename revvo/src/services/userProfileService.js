import { supabase } from '../lib/supabase';

// Busca o perfil do usuário logado
export async function getCurrentUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profile')
    .select(`*, user_role:role_id(id, name)`)
    .eq('logged_id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Atualiza ou cria o perfil do usuário
export async function upsertUserProfile(profile) {
  const { error } = await supabase
    .from('user_profile')
    .upsert(profile);
  if (error) throw error;
  return true;
}

// Busca todas as roles da empresa
export async function getRoles(companyId) {
  const { data, error } = await supabase
    .from('user_role')
    .select('*')
    .eq('company_id', companyId)
    .order('name');
  if (error) throw error;
  return data;
}

// Lista perfis de usuário da empresa
export async function listUserProfiles(companyId) {
  const { data, error } = await supabase
    .from('user_profile')
    .select(`
      *,
      user_role:role_id(id, name),
      company:company_id(id, name)
    `)
    .eq('company_id', companyId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// Deleta perfil de usuário por id
export async function deleteUserProfile(profileId) {
  const { error } = await supabase
    .from('user_profile')
    .delete()
    .eq('id', profileId);
  if (error) throw error;
  return true;
}

// Busca empresas por id (ou todas de um grupo, se necessário)
export async function listCompanies(companyId) {
  const { data, error } = await supabase
    .from('company')
    .select('id, name')
    .eq('id', companyId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// Busca nome do usuário logado pelo id
export async function getUserName(userId) {
  const { data, error } = await supabase
    .from('user_profile')
    .select('name')
    .eq('logged_id', userId)
    .single();
  if (error) throw error;
  return data?.name || '';
} 