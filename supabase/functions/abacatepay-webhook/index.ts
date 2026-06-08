import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const WEBHOOK_SECRET = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET') || ''

async function verifySignature(req: Request, bodyText: string): Promise<boolean> {
  const signatureHeader = req.headers.get('x-abacatepay-signature')

  if (!signatureHeader) {
    const auth = req.headers.get('authorization')
    if (auth && auth.replace('Bearer ', '') === WEBHOOK_SECRET) {
      return true
    }
    return false
  }

  const encoder = new TextEncoder()
  const sigKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', sigKey, encoder.encode(bodyText))
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const hexSignature = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hexSignature === signatureHeader || signatureHeader.includes(hexSignature)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyText = await req.text()

    if (WEBHOOK_SECRET) {
      const isValid = await verifySignature(req, bodyText)
      if (!isValid) {
        console.warn('Webhook signature verification failed')
        throw new Error('Invalid signature')
      }
    }

    const payload = JSON.parse(bodyText)

    // Webhook Compatibility: Support v1 and v2 payload structures
    const event = payload.event || payload.type
    const eventId = payload.id || payload.eventId

    const eventData = payload.data || payload
    const userId =
      eventData.metadata?.userId ||
      eventData.customer?.metadata?.userId ||
      eventData.customerId ||
      payload.metadata?.userId
    const planType =
      eventData.metadata?.planType ||
      eventData.customer?.metadata?.planType ||
      payload.metadata?.planType ||
      'mensal'

    if (!userId) {
      console.warn('No userId found in webhook payload')
      return new Response(JSON.stringify({ received: true, note: 'No user ID found' }), {
        status: 200,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Idempotency check: verify if we already processed this exact event
    if (eventId) {
      const { data: existingLog } = await supabaseAdmin
        .from('audit_logs')
        .select('id')
        .eq('entity_id', eventId)
        .maybeSingle()

      if (existingLog) {
        console.log('Event already processed (idempotency hit):', eventId)
        return new Response(JSON.stringify({ received: true, note: 'Already processed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    let updates: any = {}
    const now = new Date()
    let actionLog = ''

    if (
      event === 'checkout.completed' ||
      event === 'subscription.completed' ||
      event === 'billing.paid' ||
      event === 'billing.completed'
    ) {
      const days = planType === 'anual' ? 365 : 30
      updates = {
        status: 'Ativo',
        plan_type: planType,
        plan_start_date: now.toISOString(),
        plan_end_date: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: now.toISOString(),
      }
      actionLog = 'ASSINATURA_ATIVA'
    } else if (event === 'subscription.renewed') {
      const days = planType === 'anual' ? 365 : 30
      updates = {
        status: 'Ativo',
        plan_end_date: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
      }
      actionLog = 'ASSINATURA_RENOVADA'
    } else if (event === 'subscription.cancelled') {
      updates = {
        status: 'Inativo',
      }
      actionLog = 'ASSINATURA_CANCELADA'
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId)
      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      if (actionLog) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('app_name')
          .eq('id', userId)
          .single()

        await supabaseAdmin.from('audit_logs').insert({
          user_id: userId,
          action: actionLog,
          entity: 'Assinatura',
          entity_id: eventId || event,
          details: { payload: payload, updates_applied: updates },
          project_id: profile?.app_name,
        })
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
