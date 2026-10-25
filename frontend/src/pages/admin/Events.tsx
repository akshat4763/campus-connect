import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { formatDate } from '@/utils/helpers'
import type { EventItem } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const load = () => api.get('/events').then((r) => setEvents(r.data.events)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const remove = async (ev: EventItem) => {
    if (!confirm(`Delete "${ev.title}" and all its registrations?`)) return
    try { await api.delete(`/events/${ev._id}`); toast.success('Event deleted'); load() } catch (e) { toast.error(errMsg(e)) }
  }

  if (loading) return <PageSpinner />
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">All Events ({events.length})</h1>
        <Link to="/club/events/create" className={buttonVariants()}><Plus className="h-4 w-4" /> Create event</Link>
      </div>
      <Card><CardContent className="overflow-x-auto p-5">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground"><tr><th className="py-2 pr-4 font-medium">Event</th><th className="pr-4 font-medium">Club</th><th className="pr-4 font-medium">Date</th><th className="pr-4 font-medium">Seats</th><th className="text-right font-medium">Actions</th></tr></thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{ev.title}</td>
                <td className="pr-4 whitespace-nowrap">{ev.club?.name}</td>
                <td className="pr-4 whitespace-nowrap">{formatDate(ev.date)}</td>
                <td className="pr-4">{ev.registeredCount}/{ev.maxSeats}</td>
                <td className="whitespace-nowrap text-right">
                  <Link to={`/club/events/${ev._id}/registrations`} className={buttonVariants({ variant: 'outline', size: 'sm' })}><Users className="h-4 w-4" /></Link>{' '}
                  <Link to={`/club/events/edit/${ev._id}`} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9' })} aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => remove(ev)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}
