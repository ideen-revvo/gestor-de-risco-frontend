import { supabase } from '../lib/supabase';

// Busca company_id do usuário logado
export async function getUserCompanyId(userId) {
  const { data, error } = await supabase
    .from('user_profile')
    .select('company_id')
    .eq('logged_id', userId)
    .single();
  if (error) throw error;
  return data?.company_id;
}

// Busca corporate_group_id da empresa
export async function getCorporateGroupId(companyId) {
  const { data, error } = await supabase
    .from('company')
    .select('corporate_group_id')
    .eq('id', companyId)
    .single();
  if (error) throw error;
  return data?.corporate_group_id;
}

// Busca IDs das empresas do grupo
export async function listCompaniesByCorporateGroup(corporateGroupId) {
  const { data, error } = await supabase
    .from('company')
    .select('id')
    .eq('corporate_group_id', corporateGroupId);
  if (error) throw error;
  return data;
}

// Busca dados de um cliente
export async function getCustomerById(customerId) {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('id', customerId)
    .single();
  if (error) throw error;
  return data;
}

// Busca endereço pelo id
export async function getAddressById(addressId) {
  const { data, error } = await supabase
    .from('address')
    .select('*')
    .eq('id', addressId)
    .single();
  if (error) throw error;
  return data;
}

// Busca empresas do grupo por corporate_group_id
export async function getCompaniesByCorporateGroup(corporateGroupId) {
  const { data, error } = await supabase
    .from('company')
    .select('id')
    .eq('corporate_group_id', corporateGroupId);
  if (error) throw error;
  return data;
}

// Busca sales orders por companyIds e opcionalmente customerId
export async function getSalesOrders({ companyIds, customerId }) {
  let query = supabase
    .from('sale_orders')
    .select(`
      id,
      created_at,
      customer_id,
      customer:customer_id(id, name),
      total_qtt,
      total_amt,
      due_date
    `)
    .in('company_id', companyIds)
    .order('created_at', { ascending: false });
  if (customerId) query = query.eq('customer_id', customerId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
} 