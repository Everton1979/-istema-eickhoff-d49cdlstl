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

    const reqBody = await req.json()
    const { action, email, password, userId, company_name, app_name, role, access_profile } =
      reqBody

    // Get current user's profile to enforce permissions
    const { data: currentUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, app_name, is_super_admin, access_profile, cnpj, company_name')
      .eq('id', user.id)
      .single()

    if (profileError || !currentUserProfile) {
      throw new Error('User profile not found')
    }

    const isMasterEmail = user.email === 'farmaciaeickhoff@terra.com.br'
    const isSuperAdmin =
      currentUserProfile.role === 'Master' || currentUserProfile.is_super_admin || isMasterEmail
    const isProprietario =
      isSuperAdmin ||
      currentUserProfile.access_profile === 'Proprietário' ||
      currentUserProfile.role === 'Administrador'

    if (!isProprietario) {
      throw new Error('Apenas o Proprietário ou Administrador Master pode gerenciar usuários.')
    }

    if (action === 'create') {
      const fallbackAppName = currentUserProfile.app_name || user.id
      const targetAppName = isSuperAdmin ? app_name || fallbackAppName : fallbackAppName
      const targetCnpj = currentUserProfile.cnpj || ''
      const targetCompany = currentUserProfile.company_name || company_name || ''
      const targetAccessProfile = access_profile || 'Colaborador'
      const targetRole = isSuperAdmin ? role || 'Administrador' : 'Administrador'

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          app_name: targetAppName,
          cnpj: targetCnpj,
          company_name: targetCompany,
          role: targetRole,
          access_profile: targetAccessProfile,
          status: 'Aprovado',
        },
      })

      if (error) throw new Error(`Erro ao criar usuário: ${error.message}`)

      // Update profile created by trigger
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: targetRole,
          access_profile: targetAccessProfile,
          company_name: targetCompany,
          app_name: targetAppName,
          cnpj: targetCnpj,
          status: 'Aprovado',
        })
        .eq('id', data.user.id)

      if (updateError) {
        console.error('Error updating user profile after create:', updateError)
      }

      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      if (!userId) throw new Error('User ID is required')

      // Non-super-admin can only delete users in their own app_name / company
      if (!isSuperAdmin) {
        const { data: targetProfile, error: targetError } = await supabaseAdmin
          .from('profiles')
          .select('app_name, cnpj, role, access_profile')
          .eq('id', userId)
          .single()

        if (targetError || !targetProfile) {
          throw new Error('Usuário alvo não encontrado')
        }

        const samePharmacy =
          (currentUserProfile.app_name && targetProfile.app_name === currentUserProfile.app_name) ||
          (currentUserProfile.cnpj && targetProfile.cnpj === currentUserProfile.cnpj)

        if (!samePharmacy) {
          throw new Error('Você só pode excluir usuários da sua farmácia')
        }
        if (targetProfile.role === 'Master') {
          throw new Error('Não é possível excluir o usuário Master')
        }
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw new Error(`Erro ao excluir usuário: ${error.message}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
