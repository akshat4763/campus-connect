import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { CalendarDays, Download, MapPin, Ticket, X } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { useAuth } from '@/store/auth'
import { formatDate, formatTime, isPast } from '@/utils/helpers'
import type { Registration } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MyRegistrations() {
  const { user } = useAuth()
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/registrations/my').then((r) => setRegs(r.data.registrations)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const download = (r: Registration) => {
    const canvas = document.getElementById(`qr-${r._id}`) as HTMLCanvasElement | null
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `ticket-${r.ticketId}.png`
    a.click()
  }

  const cancel = async (r: Registration) => {
    if (!confirm(`Cancel your registration for "${r.event.title}"?`)) return
    try { await api.delete(`/registrations/${r._id}`); toast.success('Registration cancelled'); load() } catch (e) { toast.error(errMsg(e)) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Tickets</h1><p className="text-muted-foreground">Show the QR code at the venue entrance.</p></div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-52" />)}</div>
      ) : regs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Ticket className="h-12 w-12" /><p className="text-lg font-medium text-foreground">No tickets yet</p>
          <Link to="/" className={buttonVariants()}>Browse events</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {regs.map((r) => (
            <Card key={r._id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-lg border bg-white p-2">
                    <QRCodeCanvas id={`qr-${r._id}`} value={`Ticket: ${r.ticketId}\nEvent: ${r.event.title}\nStudent: ${user?.name ?? ''}`} size={128} marginSize={1} />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => download(r)}><Download className="h-4 w-4" /> Save</Button>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {r.attended ? <Badge variant="success">Attended</Badge> : isPast(r.event.date) ? <Badge variant="secondary">Ended</Badge> : <Badge>Confirmed</Badge>}
                  </div>
                  <Link to={`/events/${r.event._id}`} className="line-clamp-2 font-semibold leading-snug hover:text-primary">{r.event.title}</Link>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDate(r.event.date)} · {formatTime(r.event.time)}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{r.event.venue}</span></p>
                  <p className="break-all font-mono text-xs text-muted-foreground">{r.ticketId}</p>
                  {!isPast(r.event.date) && !r.attended && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => cancel(r)}><X className="h-4 w-4" /> Cancel</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
