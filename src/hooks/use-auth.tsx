import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'

export type AccessProfile = 'Proprietário' | 'Gerente' | 'Colaborador'

export interface UserProfile {
  id: string
  email: string
  role: 'Administrador' | string
  access_profile?: AccessProfile | string | null
  app_name?: string
  company_name?: string
  cnpj?: string
  razao_social?: string
  nome_fantasia?: string
  endereco?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade_estado?: string
  telefone?: string
  responsavel?: string
  status?: string
  plan_type?: 'free' | 'mensal' | 'trimestral' | 'semestral' | 'anual' | string | null
  plan_start_date?: string | null
  plan_end_date?: string | null
  admin_notes?: string | null
  is_super_admin?: boolean | null
}

export const isMasterUser = (profile: UserProfile | null, userEmail?: string | null): boolean => {
  if (!profile && !userEmail) return false
  if (profile?.role === 'Master' || profile?.is_super_admin) return true
  const email = profile?.email || userEmail || ''
  return email.toLowerCase() === 'farmaciaeickhoff@terra.com.br'
}

export const isProprietarioUser = (
  profile: UserProfile | null,
  userEmail?: string | null,
): boolean => {
  if (!profile && !userEmail) return false
  if (isMasterUser(profile, userEmail)) return true
  const access = profile?.access_profile
  // Se access_profile for nulo/indefinido em usuários legados ou administradores, o padrão do sistema é Proprietário
  if (!access) return true
  return access === 'Proprietário'
}

export const isGerenteUser = (profile: UserProfile | null, userEmail?: string | null): boolean => {
  if (!profile && !userEmail) return false
  if (isMasterUser(profile, userEmail)) return false
  return profile?.access_profile === 'Gerente'
}

export const isColaboradorUser = (
  profile: UserProfile | null,
  userEmail?: string | null,
): boolean => {
  if (!profile && !userEmail) return false
  if (isMasterUser(profile, userEmail)) return false
  return profile?.access_profile === 'Colaborador'
}

// Helpers de capacidades
export const canManageUsers = (profile: UserProfile | null, userEmail?: string | null): boolean => {
  return isMasterUser(profile, userEmail) || isProprietarioUser(profile, userEmail)
}

export const canViewStrategicReports = (
  profile: UserProfile | null,
  userEmail?: string | null,
): boolean => {
  if (isMasterUser(profile, userEmail)) return true
  return !isColaboradorUser(profile, userEmail)
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
  isMaster: boolean
  isProprietario: boolean
  isGerente: boolean
  isColaborador: boolean
  canManageUsers: boolean
  canViewStrategic: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const currentProfileId = useRef<string | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // FORBIDDEN: no async/await inside this callback — sync only
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoadingUser(false)
    })

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoadingUser(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      if (user) {
        // Only set loading to true if we don't have the profile for this user yet.
        // This prevents the "Carregando..." flash on background revalidations (e.g. Alt+Tab focus).
        if (currentProfileId.current !== user.id) {
          setLoadingProfile(true)
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (mounted) {
          if (!error && data) {
            setProfile(data as UserProfile)
            currentProfileId.current = data.id
          } else {
            setProfile(null)
            currentProfileId.current = null
          }
          setLoadingProfile(false)
        }
      } else {
        if (mounted) {
          setProfile(null)
          currentProfileId.current = null
          setLoadingProfile(false)
        }
      }
    }

    if (!loadingUser) {
      loadProfile()
    }

    return () => {
      mounted = false
    }
  }, [user, loadingUser])

  // Listener para revalidação silenciosa em background ao voltar o foco
  useEffect(() => {
    const handleFocus = () => {
      if (user && currentProfileId.current === user.id) {
        // Revalida perfil silenciosamente
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setProfile(data as UserProfile)
            }
          })
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  const handleIdle = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login?expired=true'
  }, [])

  useIdleTimeout(!!user, handleIdle)

  const loading = loadingUser || loadingProfile

  const master = isMasterUser(profile, user?.email)
  const proprietario = isProprietarioUser(profile, user?.email)
  const gerente = isGerenteUser(profile, user?.email)
  const colaborador = isColaboradorUser(profile, user?.email)
  const userCanManage = canManageUsers(profile, user?.email)
  const userCanViewStrat = canViewStrategicReports(profile, user?.email)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        loading,
        isMaster: master,
        isProprietario: proprietario,
        isGerente: gerente,
        isColaborador: colaborador,
        canManageUsers: userCanManage,
        canViewStrategic: userCanViewStrat,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
