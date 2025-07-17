import { supabase } from '../lib/supabase';

export async function inviteUser({ email, name, doc_id, birth_date, company_id, role_id, password = 'SenhaProvisoria123!' }) {
  // Obter o access_token do usuário autenticado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sessão de usuário não encontrada. Faça login novamente.');
  }
  const response = await fetch('https://vpnusoaiqtuqihkstgzt.supabase.co/functions/v1/invite-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      email,
      password,
      user_metadata: {
        name,
        doc_id,
        birth_date,
        company_id,
        role_id
      }
    })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao convidar usuário.');
  return result;
} 