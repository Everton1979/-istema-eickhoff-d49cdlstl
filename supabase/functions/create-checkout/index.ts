import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const allowedOrigins = [
  'https://controle-financeiro-planilha-9bacd--preview.goskip.app',
  'https://app.farmaciaeickhoff.com.br',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin')
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : '*',
  }
}

Deno.serve(async (req: Request) => {
  const reqCorsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: reqCorsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { plan, price, origin, cellphone, taxId, frequency } = await req.json()

    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY')
    if (!ABACATEPAY_API_KEY) {
      console.error('Missing ABACATEPAY_API_KEY environment variable')
      throw new Error('AbacatePay API key not configured')
    }

    // Fetch user profile for billing data as per acceptance criteria
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('cnpj, telefone, razao_social, nome_fantasia, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Priority: provided via client (after modal submit) or profile data
    const rawCnpj = (taxId || profile?.cnpj)?.replace(/\D/g, '')
    let rawTelefone = (cellphone || profile?.telefone)?.replace(/\D/g, '')

    // Automatically prefix with 55 if not already present
    if (rawTelefone && !rawTelefone.startsWith('55')) {
      rawTelefone = '55' + rawTelefone
    }

    // Trim email of any leading/trailing whitespace
    const rawEmail = (profile?.email || user.email || 'cliente@exemplo.com').trim()

    // Pre-flight Validation
    if (!rawCnpj || !rawTelefone || rawCnpj.length !== 14 || rawTelefone.length < 10) {
      return new Response(
        JSON.stringify({
          error: 'MISSING_BILLING_DATA',
          message: 'Por favor, complete seu CNPJ e Telefone no perfil antes de prosseguir.',
        }),
        {
          status: 400,
          headers: { ...reqCorsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Refactored payload to match AbacatePay API v1 specification
    let maxInstallments = 1
    if (plan === 'trimestral') maxInstallments = 3
    else if (plan === 'semestral') maxInstallments = 6
    else if (plan === 'anual') maxInstallments = 12

    const planNames: Record<string, string> = {
      mensal: 'Plano Mensal - Controle Financeiro',
      trimestral: 'Plano Trimestral - Controle Financeiro',
      semestral: 'Plano Semestral - Controle Financeiro',
      anual: 'Plano Anual - Controle Financeiro',
    }

    const payload = {
      frequency: 'SUBSCRIPTION',
      methods: ['PIX', 'CREDIT_CARD'], // Supported payment methods configured
      products: [
        {
          externalId: plan,
          name: planNames[plan] || 'Plano - Controle Financeiro',
          quantity: 1,
          price: price,
        },
      ],
      returnUrl: `${origin}/dashboard?payment=success`,
      completionUrl: `${origin}/dashboard?payment=success`,
      cancelUrl: `${origin}/planos`,
      customer: {
        email: rawEmail,
        name:
          profile?.razao_social || profile?.nome_fantasia || user.user_metadata?.name || 'Cliente',
        phone: rawTelefone,
        phoneNumber: rawTelefone,
        cellphone: rawTelefone,
        taxId: rawCnpj,
        metadata: {
          userId: user.id,
          planType: plan,
        },
      },
      metadata: {
        userId: user.id,
        planType: plan,
      },
    }

    console.log('Sending payload to AbacatePay v1:', JSON.stringify(payload))

    // Endpoint migrated to /v1/ paths as per AbacatePay documentation
    const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('AbacatePay Raw Response:', responseText, 'Status:', response.status)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse AbacatePay response', responseText)
      throw new Error('Invalid response from payment gateway')
    }

    if (!response.ok) {
      // Enhanced Error Diagnostics logging full response body from AbacatePay
      console.error(`AbacatePay API v1 Error Details (${response.status}):`, responseText)
      let errorMessage = data?.error?.message || data?.message || data?.detail

      if (!errorMessage && typeof data?.error === 'string') {
        errorMessage = data.error
      }
      if (!errorMessage && data?.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors
            .map((e: any) => e.message || e.field || JSON.stringify(e))
            .join(', ')
        } else {
          errorMessage = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors)
        }
      }

      throw new Error(
        errorMessage || `Payment gateway error: ${response.status} - ${JSON.stringify(data)}`,
      )
    }

    const checkoutUrl = data.data?.url || data.url
    if (!checkoutUrl) {
      console.error('Missing URL in AbacatePay response:', data)
      throw new Error('Checkout URL not returned from gateway')
    }

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...reqCorsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('Checkout creation error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'INTERNAL_ERROR', message: err.message }),
      {
        status: 400,
        headers: { ...reqCorsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
