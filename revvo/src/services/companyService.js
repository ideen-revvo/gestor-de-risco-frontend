import { supabase } from '../lib/supabase';

// Busca empresa pelo ID
export async function getCompanyById(companyId) {
  const { data, error } = await supabase
    .from('company')
    .select('*, address:address_id(*)')
    .eq('id', companyId)
    .single();
  if (error) throw error;
  return data;
}

// Atualiza empresa
export async function updateCompany(companyId, companyData) {
  const { error } = await supabase
    .from('company')
    .update(companyData)
    .eq('id', companyId);
  if (error) throw error;
  return true;
}

// Cria empresa
export async function createCompany(companyData) {
  const { data, error } = await supabase
    .from('company')
    .insert([companyData])
    .select();
  if (error) throw error;
  return data[0];
}

// Atualiza endereço
export async function updateAddress(addressId, addressData) {
  const { error } = await supabase
    .from('address')
    .update(addressData)
    .eq('id', addressId);
  if (error) throw error;
  return true;
}

// Cria endereço
export async function createAddress(addressData) {
  const { data, error } = await supabase
    .from('address')
    .insert([addressData])
    .select();
  if (error) throw error;
  return data[0];
}

// Busca corporate_group_id de uma empresa
export async function getCorporateGroupId(companyId) {
  const { data, error } = await supabase
    .from('company')
    .select('corporate_group_id')
    .eq('id', companyId)
    .single();
  if (error) throw error;
  return data?.corporate_group_id;
}

// Busca todas as empresas de um corporate_group_id
export async function listCompaniesByCorporateGroup(corporateGroupId) {
  const { data, error } = await supabase
    .from('company')
    .select('id')
    .eq('corporate_group_id', corporateGroupId);
  if (error) throw error;
  return data;
}

// Busca faturamento mensal por corporate_group_id e opcionalmente por customer_id
export async function getMonthlyBilling(corporateGroupId, customerId = null) {
  let query = supabase
    .from('vw_faturamento_mensal')
    .select('*')
    .eq('corporate_group_id', corporateGroupId);
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
} 