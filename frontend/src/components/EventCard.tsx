import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime, isPast } from '@/utils/helpers'
import type { EventItem } from '@/types'

export default function EventCard({ event }: { event: EventItem }) {
  const left = event.maxSeats - event.registeredCount
  const past = isPast(event.date)
  return (
    <Link to={`/events/${event._id}`} className="group">
      <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-1 group-hover:border-white/25 group-hover:bg-white/[0.04]">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950">
          {event.image && <img src={event.image} alt={event.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
          <Badge className="absolute left-3 top-3 bg-black/60 backdrop-blur" variant="secondary">{event.category}</Badge>
          {past && <Badge className="absolute right-3 top-3 backdrop-blur" variant="destructive">Ended</Badge>}
        </div>
        <CardContent className="space-y-3 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{event.club?.name}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug">{event.title}</h3>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(event.date)}</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(event.time)}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="line-clamp-1">{event.venue}</span></p>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />{event.registeredCount}/{event.maxSeats}</span>
            {left <= 0 ? <Badge variant="destructive">Full</Badge> : <Badge variant="success">{left} seats left</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
