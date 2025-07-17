import { supabase } from '../lib/supabase';

// Busca sales orders por companyIds e opcionalmente por customerId
export async function listSalesOrders(companyIds, customerId = null) {
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
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
} 