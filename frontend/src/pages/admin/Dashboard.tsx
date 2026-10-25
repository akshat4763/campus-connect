import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Building2, Ticket, UserCheck, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { formatDate } from '@/utils/helpers'
import type { EventItem } from '@/types'
import StatCard from '@/components/StatCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats { users: number; clubs: number; events: number; registrations: number; attended: number; recentEvents: EventItem[] }

export default function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null)
  useEffect(() => { api.get('/stats/admin').then((r) => setS(r.data)).catch((e) => toast.error(errMsg(e))) }, [])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Super Admin Dashboard</h1><p className="text-muted-foreground">Overview of the whole platform.</p></div>
      {!s ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Users" value={s.users} icon={Users} />
          <StatCard label="Clubs" value={s.clubs} icon={Building2} />
          <StatCard label="Events" value={s.events} icon={CalendarDays} />
          <StatCard label="Registrations" value={s.registrations} icon={Ticket} />
          <StatCard label="Attended" value={s.attended} icon={UserCheck} />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/clubs" className={buttonVariants({ variant: 'outline' })}>Manage clubs</Link>
        <Link to="/admin/users" className={buttonVariants({ variant: 'outline' })}>Manage users</Link>
        <Link to="/admin/events" className={buttonVariants({ variant: 'outline' })}>All events</Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Recently added events</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {s?.recentEvents.map((e) => (
            <div key={e._id} className="flex items-center justify-between py-3 text-sm">
              <div><p className="font-medium">{e.title}</p><p className="text-muted-foreground">{e.club?.name}</p></div>
              <span className="text-muted-foreground">{formatDate(e.date)}</span>
            </div>
          ))}
          {s && s.recentEvents.length === 0 && <p className="py-4 text-muted-foreground">No events yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
