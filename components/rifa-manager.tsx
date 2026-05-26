'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Trash2, Edit2, Search, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RifaNumber {
  id: number
  number: string
  description?: string
  createdAt: string
}

export function RifaManager() {
  const router = useRouter()
  const [rifas, setRifas] = useState<RifaNumber[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNumber, setEditNumber] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Cargar números al montar el componente
  useEffect(() => {
    loadRifas()
  }, [])

  const loadRifas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rifas')
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al cargar los números')
        return
      }

      setRifas(data)
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al cargar los números')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRifa = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNumber.trim()) {
      toast.error('Ingresa un número')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/rifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newNumber,
          description: description || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al agregar')
        return
      }

      toast.success('Número agregado exitosamente')
      setNewNumber('')
      setDescription('')
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al agregar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      await loadRifas()
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(`/api/rifas/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error en la búsqueda')
        return
      }

      setRifas(data)
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error en la búsqueda')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este número?')) {
      return
    }

    try {
      const response = await fetch(`/api/rifas/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al eliminar')
        return
      }

      toast.success('Número eliminado')
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al eliminar')
    }
  }

  const handleEditStart = (rifa: RifaNumber) => {
    setEditingId(rifa.id)
    setEditNumber(rifa.number)
    setEditDescription(rifa.description || '')
  }

  const handleEditSave = async () => {
    if (!editNumber.trim()) {
      toast.error('Ingresa un número')
      return
    }

    try {
      const response = await fetch(`/api/rifas/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: editNumber,
          description: editDescription || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al actualizar')
        return
      }

      toast.success('Número actualizado')
      setEditingId(null)
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al actualizar')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sistema de Rifa</h1>
            <p className="text-slate-600">Gestiona tus números de rifa fácilmente</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Agregar número */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Número</CardTitle>
            <CardDescription>Registra un nuevo número de rifa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRifa} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="text"
                    placeholder="Ej: RIF-001"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descripción (opcional)</Label>
                  <Input
                    id="desc"
                    type="text"
                    placeholder="Ej: premio especial"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agregar Número
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Números</CardTitle>
            <CardDescription>Busca números de rifa por número</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Buscar número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de números */}
        <Card>
          <CardHeader>
            <CardTitle>Números Registrados</CardTitle>
            <CardDescription>Total: {rifas.length} números</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : rifas.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No hay números registrados</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rifas.map((rifa) => (
                  <div
                    key={rifa.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4 hover:bg-slate-100 transition"
                  >
                    {editingId === rifa.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          placeholder="Número"
                        />
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditSave}>
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{rifa.number}</p>
                          {rifa.description && (
                            <p className="text-sm text-slate-600">{rifa.description}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {new Date(rifa.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(rifa)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(rifa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
