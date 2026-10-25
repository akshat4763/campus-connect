import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CalendarDays, Pencil, Plus, Trash2, UserCheck, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { useAuth } from '@/store/auth'
import { formatDate } from '@/utils/helpers'
import type { EventItem } from '@/types'
import StatCard from '@/components/StatCard'
import { buttonVariants, Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats { events: number; upcoming: number; registrations: number; attended: number }

export default function ClubDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const clubId = user?.club?._id

  const load = async () => {
    try {
      const [s, e] = await Promise.all([api.get('/stats/club'), clubId ? api.get('/events', { params: { club: clubId } }) : Promise.resolve({ data: { events: [] } })])
      setStats(s.data); setEvents(e.data.events)
    } catch (err) { toast.error(errMsg(err)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [clubId]) // eslint-disable-line

  const remove = async (ev: EventItem) => {
    if (!confirm(`Delete "${ev.title}" and all its registrations?`)) return
    try { await api.delete(`/events/${ev._id}`); toast.success('Event deleted'); load() } catch (e) { toast.error(errMsg(e)) }
  }

  if (!clubId) return <Card><CardContent className="p-8 text-center text-muted-foreground">You haven't been assigned to a club yet. Ask the super admin to assign you.</CardContent></Card>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{user?.club?.name} Dashboard</h1><p className="text-muted-foreground">Manage your events and attendance.</p></div>
        <Link to="/club/events/create" className={buttonVariants()}><Plus className="h-4 w-4" /> Create event</Link>
      </div>

      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My events" value={stats?.events ?? 0} icon={CalendarDays} />
          <StatCard label="Upcoming" value={stats?.upcoming ?? 0} icon={CalendarCheck} />
          <StatCard label="Total registrations" value={stats?.registrations ?? 0} icon={Users} />
          <StatCard label="Attended" value={stats?.attended ?? 0} icon={UserCheck} />
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>My events</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {events.length === 0 ? <p className="py-6 text-center text-muted-foreground">No events yet — create your first one!</p> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground"><tr><th className="py-2 pr-4 font-medium">Event</th><th className="pr-4 font-medium">Date</th><th className="pr-4 font-medium">Seats</th><th className="text-right font-medium">Actions</th></tr></thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{ev.title}</td>
                    <td className="pr-4 whitespace-nowrap">{formatDate(ev.date)}</td>
                    <td className="pr-4">{ev.registeredCount}/{ev.maxSeats}</td>
                    <td className="whitespace-nowrap text-right">
                      <Link to={`/club/events/${ev._id}/registrations`} className={buttonVariants({ variant: 'outline', size: 'sm' })}><Users className="h-4 w-4" /> Registrations</Link>{' '}
                      <Link to={`/club/events/edit/${ev._id}`} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9' })} aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => remove(ev)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
