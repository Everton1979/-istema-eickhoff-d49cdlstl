import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagement } from '@/components/settings/UserManagement'

export default function Settings() {
  const { profile } = useAuth()

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-md border p-6 animate-fade-in-up overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as permissões e o acesso dos usuários ao sistema.
        </p>
      </div>

      <div className="max-w-4xl">
        {profile?.role === 'Administrador' ? (
          <Card>
            <CardHeader>
              <CardTitle>Usuários e Permissões</CardTitle>
              <CardDescription>
                Gerencie os papéis de acesso da sua equipe. Visitantes não podem alterar dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8 text-muted-foreground border rounded-md">
            Você não tem permissão para visualizar as configurações do sistema. Apenas
            administradores podem gerenciar usuários.
          </div>
        )}
      </div>
    </div>
  )
}
