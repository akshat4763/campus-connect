import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg, uploadImage } from '@/utils/api'
import { useAuth } from '@/store/auth'
import { CATEGORIES, homeFor } from '@/utils/helpers'
import type { Club } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner, PageSpinner } from '@/components/ui/spinner'

const schema = z.object({
  title: z.string().min(3, 'Title is too short'),
  description: z.string().min(10, 'Add a short description (10+ characters)'),
  date: z.string().min(1, 'Pick a date'),
  time: z.string().min(1, 'Pick a time'),
  venue: z.string().min(2, 'Venue is required'),
  category: z.string().min(1, 'Pick a category'),
  maxSeats: z.number({ invalid_type_error: 'Enter number of seats' }).int().min(1, 'At least 1 seat'),
  club: z.string().optional(),
})
type FV = z.infer<typeof schema>

export default function EventForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSuper = user?.role === 'superAdmin'
  const [clubs, setClubs] = useState<Club[]>([])
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(editing)
  const fileRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Technical' },
  })

  useEffect(() => { if (isSuper) api.get('/clubs').then((r) => setClubs(r.data.clubs)) }, [isSuper])

  useEffect(() => {
    if (!id) return
    api.get(`/events/${id}`).then(({ data }) => {
      const e = data.event
      reset({ title: e.title, description: e.description, date: String(e.date).slice(0, 10), time: e.time, venue: e.venue, category: e.category, maxSeats: e.maxSeats, club: e.club?._id })
      setImage(e.image || '')
    }).catch((err) => { toast.error(errMsg(err)); navigate(-1) }).finally(() => setLoading(false))
  }, [id, reset, navigate])

  const onFile = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { setImage(await uploadImage(file)); toast.success('Image uploaded') } catch (e) { toast.error(errMsg(e, 'Upload failed')) } finally { setUploading(false) }
  }

  const onSubmit = async (v: FV) => {
    if (isSuper && !v.club) return toast.error('Please select a club')
    const payload = { ...v, image, ...(isSuper ? {} : { club: undefined }) }
    try {
      if (editing) await api.put(`/events/${id}`, payload)
      else await api.post('/events', payload)
      toast.success(editing ? 'Event updated' : 'Event created')
      navigate(user ? (isSuper ? '/admin/events' : homeFor(user.role)) : '/')
    } catch (e) { toast.error(errMsg(e)) }
  }

  if (loading) return <PageSpinner />
  const err = (k: keyof FV) => errors[k] && <p className="text-sm text-destructive">{errors[k]?.message}</p>

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader><CardTitle className="text-2xl">{editing ? 'Edit event' : 'Create event'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
                  {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}
                </div>
                <div>
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading && <Spinner className="h-4 w-4" />} {image ? 'Change' : 'Upload'} image</Button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" {...register('title')} />{err('title')}</div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" {...register('description')} />{err('description')}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" {...register('date')} />{err('date')}</div>
              <div className="space-y-2"><Label htmlFor="time">Time</Label><Input id="time" type="time" {...register('time')} />{err('time')}</div>
            </div>
            <div className="space-y-2"><Label htmlFor="venue">Venue</Label><Input id="venue" {...register('venue')} />{err('venue')}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="category">Category</Label><Select id="category" {...register('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>{err('category')}</div>
              <div className="space-y-2"><Label htmlFor="maxSeats">Max seats</Label><Input id="maxSeats" type="number" min={1} {...register('maxSeats', { valueAsNumber: true })} />{err('maxSeats')}</div>
            </div>
            {isSuper && (
              <div className="space-y-2"><Label htmlFor="club">Club</Label>
                <Select id="club" {...register('club')}><option value="">Select a club…</option>{clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || uploading}>{isSubmitting && <Spinner className="h-4 w-4" />} {editing ? 'Save changes' : 'Create event'}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
