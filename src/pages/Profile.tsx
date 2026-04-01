import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const passwordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function Profile() {
  const { user, profile, updatePassword } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsUpdating(true)
    try {
      const { error } = await updatePassword(data.password)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar a senha',
          description: error.message,
        })
      } else {
        toast({
          title: 'Senha atualizada com sucesso',
          description: 'Sua senha foi alterada. Use a nova senha no próximo acesso.',
        })
        form.reset()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h2>
          <p className="text-slate-500 mt-2">
            Gerencie as informações da sua conta e preferências de segurança.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Detalhes básicos do seu perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">E-mail</p>
                <p className="text-base font-medium text-slate-900">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Empresa</p>
                <p className="text-base font-medium text-slate-900">
                  {profile?.company_name || 'Não informada'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Perfil de Acesso</p>
                <p className="text-base font-medium text-slate-900">{profile?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso à plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? 'Atualizando...' : 'Atualizar Senha'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
