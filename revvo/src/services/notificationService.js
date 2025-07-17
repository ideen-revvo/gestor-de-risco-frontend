import { supabase } from '../lib/supabase';

// Busca notificações de workflow para o usuário logado
export async function getWorkflowNotifications(userId) {
  // Buscar perfil do usuário para obter role_id
  const { data: userProfile } = await supabase
    .from('user_profile')
    .select('id, name, role_id')
    .eq('logged_id', userId)
    .single();
  if (!userProfile) return [];
  // Buscar workflow_details para a role do usuário
  const { data: workflowDetails, error } = await supabase
    .from('workflow_details')
    .select(`
      id,
      workflow_sale_order_id,
      approval,
      workflow_sale_order (
        credit_limit_req_id,
        credit_limit_request!inner (
          id, created_at, credit_limit_amt, customer_id, status_id
        )
      )
    `)
    .eq('jurisdiction_id', userProfile.role_id)
    .is('approval', null);
  if (error) throw error;
  // Montar notificações
  return (workflowDetails || []).map(wd => ({
    id: wd.id,
    title: 'Solicitação de limite pendente',
    message: `Solicitação #${wd.workflow_sale_order?.credit_limit_req_id} de limite de crédito`,
    time: wd.workflow_sale_order?.credit_limit_request?.created_at
      ? new Date(wd.workflow_sale_order.credit_limit_request.created_at).toLocaleString('pt-BR')
      : '',
    unread: true,
    request: wd.workflow_sale_order?.credit_limit_request
  }));
} 