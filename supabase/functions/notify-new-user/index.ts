import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
