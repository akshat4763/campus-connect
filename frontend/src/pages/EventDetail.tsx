import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, MapPin, Ticket, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { useAuth } from '@/store/auth'
import { formatDate, formatTime, isPast } from '@/utils/helpers'
import type { EventItem, Registration } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/events/${id}`)
      setEvent(data.event)
    } catch (e) { toast.error(errMsg(e, 'Event not found')); navigate('/') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (user?.role !== 'student') return
    api.get('/registrations/my').then((r) => setRegistered((r.data.registrations as Registration[]).some((x) => x.event._id === id))).catch(() => {})
  }, [user, id])

  const handleRegister = async () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } })
    setBusy(true)
    try {
      await api.post('/registrations', { eventId: id })
      toast.success('You are registered! Your ticket is ready.')
      navigate('/my-registrations')
    } catch (e) { toast.error(errMsg(e)); load() }
    finally { setBusy(false) }
  }

  if (loading || !event) return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="aspect-video w-full" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /></div>

  const left = event.maxSeats - event.registeredCount
  const past = isPast(event.date)

  const action = () => {
    if (past) return <Button disabled className="w-full">Event has ended</Button>
    if (user && user.role !== 'student') return <p className="text-center text-sm text-muted-foreground">Admins can't register for events.</p>
    if (registered) return <Link to="/my-registrations" className={buttonVariants({ variant: 'secondary', className: 'w-full' })}><Ticket className="h-4 w-4" /> Already registered — view ticket</Link>
    if (left <= 0) return <Button disabled className="w-full">Event is full</Button>
    return <Button className="w-full" size="lg" onClick={handleRegister} disabled={busy}>{busy && <Spinner className="h-4 w-4" />} {user ? 'Register now' : 'Login to register'}</Button>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All events</Link>
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-zinc-800 to-zinc-950">
        <div className="aspect-[21/9] w-full">{event.image && <img src={event.image} alt={event.title} className="h-full w-full object-cover" />}</div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="flex flex-wrap items-center gap-2"><Badge>{event.category}</Badge><span className="text-sm font-medium text-primary">{event.club?.name}</span></div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{event.description}</p>
        </div>
        <Card className="h-fit">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(event.date)}</p>
              <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" />{formatTime(event.time)}</p>
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" />{event.venue}</p>
              <p className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" />{event.registeredCount} / {event.maxSeats} registered ({Math.max(left, 0)} left)</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (event.registeredCount / event.maxSeats) * 100)}%` }} /></div>
            {action()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
