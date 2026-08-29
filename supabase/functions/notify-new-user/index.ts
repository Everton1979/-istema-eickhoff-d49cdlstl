import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Allow internal service_role call or valid authenticated user
    const isServiceKey = supabaseServiceKey && token === supabaseServiceKey

    if (!isServiceKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })

      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser(token)
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const data = await req.json()

    // Check if Resend API key is available in the environment to send actual emails
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'farmaciaeickhoff@terra.com.br',
          subject: 'Novo cadastro de empresa - Controle Financeiro',
          html: `<h2>Novo Cadastro Realizado</h2>
                 <p>Um novo usuário solicitou acesso ao sistema.</p>
                 <ul>
                   <li><strong>Email:</strong> ${data.email || 'Não informado'}</li>
                   <li><strong>Razão Social:</strong> ${data.razao_social || 'Não informado'}</li>
                   <li><strong>Responsável:</strong> ${data.responsavel || 'Não informado'}</li>
                   <li><strong>Telefone:</strong> ${data.telefone || 'Não informado'}</li>
                   <li><strong>Sistema:</strong> ${data.app_name || 'Não informado'}</li>
                 </ul>
                 <p>Acesse o painel administrativo para aprovar ou rejeitar o acesso.</p>`,
        }),
      })
      console.log('Notificação por e-mail enviada para farmaciaeickhoff@terra.com.br')
    } else {
      console.log(
        'Notificação recebida com sucesso. (E-mail real não enviado: RESEND_API_KEY não configurada)',
        data,
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Erro na Edge Function notify-new-user:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
