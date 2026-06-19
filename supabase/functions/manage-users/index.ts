import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Create client with the user's JWT to verify their identity and role
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // Create admin client to bypass RLS and use auth.admin methods
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { action, email, password, userId, company_name, app_name, role } = await req.json()

    // Get current user's profile to enforce permissions
    const { data: currentUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, app_name, is_super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !currentUserProfile) {
      throw new Error('User profile not found')
    }

    const isMasterEmail = user.email === 'farmaciaeickhoff@terra.com.br'
    const isSuperAdmin =
      currentUserProfile.role === 'Master' ||
      currentUserProfile.role === 'Administrador' ||
      currentUserProfile.role === 'admin' ||
      currentUserProfile.is_super_admin ||
      isMasterEmail

    if (action === 'create') {
      const fallbackAppName = currentUserProfile.app_name || user.id
      let targetAppName = app_name || fallbackAppName

      // Master users can only create users for their own app_name
      if (!isSuperAdmin) {
        targetAppName = fallbackAppName
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { app_name: targetAppName },
      })
      if (error) throw error

      let targetRole = role || 'Atendente'

      // Prevent Master from creating another Administrador
      if (!isSuperAdmin && targetRole === 'Administrador') {
        targetRole = 'Atendente'
      }

      // Update the profile role and company_name
      await supabaseAdmin
        .from('profiles')
        .update({
          role: targetRole,
          company_name: company_name || null,
          status: 'Ativo',
          app_name: targetAppName,
        })
        .eq('id', data.user.id)

      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      if (!userId) throw new Error('ID do usuário não fornecido para exclusão.')
      // Don't allow deleting self
      if (userId === user.id) {
        throw new Error('Não é permitido excluir o próprio usuário')
      }

      // Check target user
      const { data: targetUser, error: targetError } = await supabaseAdmin
        .from('profiles')
        .select('app_name, role')
        .eq('id', userId)
        .single()

      if (targetError || !targetUser) {
        throw new Error('Usuário alvo não encontrado.')
      }

      if (!isSuperAdmin) {
        const fallbackAppName = currentUserProfile.app_name || user.id
        if (targetUser.app_name !== fallbackAppName) {
          throw new Error('Acesso negado: Você não tem permissão para excluir este usuário.')
        }
        if (
          targetUser.role === 'Master' ||
          targetUser.role === 'Administrador' ||
          targetUser.role === 'admin'
        ) {
          throw new Error('Acesso negado: Não é possível excluir um Administrador/Master.')
        }
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw new Error(`Erro ao excluir usuário: ${error.message}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
