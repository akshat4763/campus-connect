import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import type { Club } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner, PageSpinner } from '@/components/ui/spinner'

export default function AdminClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/clubs').then((r) => setClubs(r.data.clubs)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const reset = () => { setEditId(null); setName(''); setDescription('') }
  const startEdit = (c: Club) => { setEditId(c._id); setName(c.name); setDescription(c.description ?? ''); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await api.put(`/clubs/${editId}`, { name, description })
      else await api.post('/clubs', { name, description })
      toast.success(editId ? 'Club updated' : 'Club created')
      reset(); load()
    } catch (err) { toast.error(errMsg(err)) } finally { setSaving(false) }
  }

  const remove = async (c: Club) => {
    if (!confirm(`Delete "${c.name}"? Its events and registrations will also be removed, and its admins become students.`)) return
    try { await api.delete(`/clubs/${c._id}`); toast.success('Club deleted'); load() } catch (e) { toast.error(errMsg(e)) }
  }

  if (loading) return <PageSpinner />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Clubs</h1>
      <Card>
        <CardHeader><CardTitle>{editId ? 'Edit club' : 'Add a club'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="cname">Name</Label><Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="cdesc">Description</Label><Textarea id="cdesc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !name.trim()}>{saving ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {editId ? 'Save' : 'Add club'}</Button>
              {editId && <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c) => (
          <Card key={c._id}>
            <CardContent className="space-y-3 p-5">
              <div><h3 className="font-semibold">{c.name}</h3><p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description || 'No description'}</p></div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {clubs.length === 0 && <p className="text-muted-foreground">No clubs yet.</p>}
      </div>
    </div>
  )
}
