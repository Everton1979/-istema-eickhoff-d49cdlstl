import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  role: 'Administrador' | string
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

  const loading = loadingUser || loadingProfile

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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
