'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = type === 'login'
        ? { username, password }
        : { username, email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error en la autenticación')
        return
      }

      toast.success(data.message || 'Operación exitosa')
      router.push('/dashboard')
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error en la conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </CardTitle>
          <CardDescription>
            {type === 'login'
              ? 'Ingresa tus credenciales para acceder'
              : 'Crea una cuenta para empezar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {type === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {type === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:underline"
                >
                  Registrarse aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
