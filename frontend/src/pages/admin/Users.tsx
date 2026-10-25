import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { useAuth } from '@/store/auth'
import type { Club, Role, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { PageSpinner } from '@/components/ui/spinner'

function UserRow({ u, clubs, isMe, onSaved }: { u: User; clubs: Club[]; isMe: boolean; onSaved: (u: User) => void }) {
  const [role, setRole] = useState<Role>(u.role)
  const [club, setClub] = useState(u.club?._id ?? '')
  const [saving, setSaving] = useState(false)
  const dirty = role !== u.role || (role === 'clubAdmin' && club !== (u.club?._id ?? ''))

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch(`/users/${u._id}/role`, { role, club: role === 'clubAdmin' ? club : undefined })
      onSaved(data.user); toast.success(`${u.name} is now ${role}`)
    } catch (e) { toast.error(errMsg(e)) } finally { setSaving(false) }
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4"><div className="flex items-center gap-3"><Avatar src={u.avatar} name={u.name} /><div><p className="font-medium">{u.name}{isMe && ' (you)'}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></td>
      <td className="pr-4"><Select value={role} disabled={isMe} onChange={(e) => setRole(e.target.value as Role)} className="h-9 min-w-[130px]"><option value="student">Student</option><option value="clubAdmin">Club Admin</option><option value="superAdmin">Super Admin</option></Select></td>
      <td className="pr-4">{role === 'clubAdmin' ? <Select value={club} onChange={(e) => setClub(e.target.value)} className="h-9 min-w-[150px]"><option value="">Select club…</option>{clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select> : <span className="text-muted-foreground">—</span>}</td>
      <td className="text-right"><Button size="sm" onClick={save} disabled={!dirty || saving || (role === 'clubAdmin' && !club)}>Save</Button></td>
    </tr>
  )
}

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/clubs')]).then(([u, c]) => { setUsers(u.data.users); setClubs(c.data.clubs) }).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />
  const shown = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Manage Users</h1><Input className="max-w-xs" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Card><CardContent className="overflow-x-auto p-5">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground"><tr><th className="py-2 pr-4 font-medium">User</th><th className="pr-4 font-medium">Role</th><th className="pr-4 font-medium">Club</th><th /></tr></thead>
          <tbody>{shown.map((u) => <UserRow key={u._id + u.role + (u.club?._id ?? '')} u={u} clubs={clubs} isMe={u._id === me?._id} onSaved={(nu) => setUsers((l) => l.map((x) => (x._id === nu._id ? nu : x)))} />)}</tbody>
        </table>
        {shown.length === 0 && <p className="py-6 text-center text-muted-foreground">No users found.</p>}
      </CardContent></Card>
    </div>
  )
}
