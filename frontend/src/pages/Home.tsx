import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { CATEGORIES } from '@/utils/helpers'
import type { Club, EventItem } from '@/types'
import EventCard from '@/components/EventCard'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [club, setClub] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [upcoming, setUpcoming] = useState(true)

  useEffect(() => { api.get('/clubs').then((r) => setClubs(r.data.clubs)).catch(() => {}) }, [])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const params: Record<string, string> = {}
      if (q) params.q = q
      if (club) params.club = club
      if (category) params.category = category
      if (date) params.date = date
      else if (upcoming) params.upcoming = 'true'
      api.get('/events', { params })
        .then((r) => setEvents(r.data.events))
        .catch((e) => toast.error(errMsg(e, 'Could not load events')))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [q, club, category, date, upcoming])

  const clear = () => { setQ(''); setClub(''); setCategory(''); setDate(''); setUpcoming(true) }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-card/40 px-6 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-72 w-2/3 rounded-full bg-white/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative">
          <Badge variant="outline" className="mb-6 px-3 py-1 text-muted-foreground">Events · Clubs · Tickets</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tighter md:text-6xl">The home for every event on campus.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Discover what your clubs are up to, grab your seat in seconds, and walk in with a QR ticket.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#events" className={buttonVariants({ size: 'lg' })}>Browse events</a>
            {user ? (user.role === 'student' ? <Link to="/my-registrations" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>My tickets</Link> : null)
              : <Link to="/register" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>Create account</Link>}
          </div>
          <div className="relative mx-auto mt-10 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events or venues…" className="h-12 pl-11" />
          </div>
        </div>
      </section>

      <section id="events" className="grid scroll-mt-24 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={club} onChange={(e) => setClub(e.target.value)}>
          <option value="">All clubs</option>
          {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant={upcoming && !date ? 'default' : 'outline'} onClick={() => setUpcoming(!upcoming)} disabled={!!date}>
          {upcoming ? 'Upcoming only' : 'Showing all'}
        </Button>
        <Button variant="ghost" onClick={clear}>Clear filters</Button>
      </section>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden"><Skeleton className="aspect-video rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <SearchX className="h-12 w-12" />
          <p className="text-lg font-medium text-foreground">No events found</p>
          <p>Try changing your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map((e) => <EventCard key={e._id} event={e} />)}</div>
      )}
    </div>
  )
}
