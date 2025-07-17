import { supabase } from '../lib/supabase';

// Busca detalhes de pedidos e faturas
export async function listOrderDetails() {
  const { data, error } = await supabase
    .from('vw_detalhes_pedidos_faturas')
    .select('*')
    .order('pedido_data', { ascending: false });
  if (error) throw error;
  return data;
} 