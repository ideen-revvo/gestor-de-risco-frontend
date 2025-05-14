// Follow Edge Function format
import { createClient } from "npm:@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Get request data
    const { name, email, company_id } = await req.json()

    if (!name || !email || !company_id) {
      throw new Error('Name, email and company_id are required')
    }

    // Get auth token from request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create invite record
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('user_invite')
      .insert({
        name,
        email,
        company_id,
        status: 'pending',
        invited_by: authHeader.replace('Bearer ', '')
      })
      .select()
      .single()

    if (inviteError) {
      throw inviteError
    }

    // Send invite email
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        invite_id: invite.id,
        company_id: company_id.toString(),
        name
      }
    })

    if (emailError) {
      // Rollback invite if email fails
      await supabaseAdmin
        .from('user_invite')
        .delete()
        .eq('id', invite.id)

      throw emailError
    }

    return new Response(JSON.stringify({ 
      message: 'Invite sent successfully',
      invite_url: invite.invite_url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})