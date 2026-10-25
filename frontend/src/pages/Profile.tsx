import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg, uploadImage } from '@/utils/api'
import { useAuth } from '@/store/auth'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const roleLabel = { student: 'Student', clubAdmin: 'Club Admin', superAdmin: 'Super Admin' }

export default function Profile() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  if (!user) return null

  const save = async (patch: { name?: string; avatar?: string }) => {
    const { data } = await api.put('/auth/me', patch)
    setUser(data.user)
  }

  const onSave = async () => {
    setSaving(true)
    try { await save({ name }); toast.success('Profile updated') } catch (e) { toast.error(errMsg(e)) } finally { setSaving(false) }
  }

  const onAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { await save({ avatar: await uploadImage(file) }); toast.success('Photo updated') } catch (e) { toast.error(errMsg(e, 'Upload failed')) } finally { setUploading(false) }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader><CardTitle className="text-2xl">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={user.avatar} name={user.name} className="h-20 w-20 text-2xl" />
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow" aria-label="Change photo">
                {uploading ? <Spinner className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onAvatar(e.target.files?.[0])} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{user.name}</p>
              <div className="flex gap-2"><Badge>{roleLabel[user.role]}</Badge>{user.club && <Badge variant="outline">{user.club.name}</Badge>}</div>
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={user.email} disabled /></div>
          <Button onClick={onSave} disabled={saving || name.trim().length < 2 || name === user.name}>{saving && <Spinner className="h-4 w-4" />} Save changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
