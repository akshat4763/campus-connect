import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { toast } from 'sonner'
import { api, errMsg } from '@/utils/api'
import { formatDate } from '@/utils/helpers'
import type { EventItem, Registration } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'

export default function EventRegistrations() {
  const { id } = useParams()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/registrations/event/${id}`).then(({ data }) => { setEvent(data.event); setRegs(data.registrations) }).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false))
  }, [id])

  const toggle = async (r: Registration) => {
    const next = !r.attended
    setRegs((list) => list.map((x) => (x._id === r._id ? { ...x, attended: next } : x))) // optimistic
    try { await api.patch(`/registrations/${r._id}/attendance`, { attended: next }) } catch (e) {
      toast.error(errMsg(e)); setRegs((list) => list.map((x) => (x._id === r._id ? { ...x, attended: r.attended } : x)))
    }
  }

  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Ticket ID', 'Registered on', 'Attended'], ...regs.map((r) => [r.user.name, r.user.email, r.ticketId, formatDate(r.createdAt), r.attended ? 'Yes' : 'No'])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${event?.title ?? 'event'}-registrations.csv`
    a.click()
  }

  if (loading) return <PageSpinner />
  const attended = regs.filter((r) => r.attended).length

  return (
    <div className="space-y-6">
      <button onClick={() => history.back()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{event?.title}</h1><p className="text-muted-foreground">{regs.length} registered · {attended} attended</p></div>
        <Button variant="outline" onClick={exportCsv} disabled={!regs.length}><Download className="h-4 w-4" /> Export CSV</Button>
      </div>
      <Card>
        <CardContent className="overflow-x-auto p-5">
          {regs.length === 0 ? <p className="py-6 text-center text-muted-foreground">No registrations yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground"><tr><th className="py-2 pr-4 font-medium">Student</th><th className="pr-4 font-medium">Ticket ID</th><th className="pr-4 font-medium">Registered</th><th className="text-right font-medium">Attendance</th></tr></thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r._id} className="border-b last:border-0">
                    <td className="py-3 pr-4"><p className="font-medium">{r.user.name}</p><p className="text-xs text-muted-foreground">{r.user.email}</p></td>
                    <td className="pr-4 font-mono text-xs">{r.ticketId}</td>
                    <td className="pr-4 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="text-right">
                      <Button size="sm" variant={r.attended ? 'default' : 'outline'} onClick={() => toggle(r)}>{r.attended ? <><Check className="h-4 w-4" /> Present</> : 'Mark present'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {attended > 0 && <div className="mt-4"><Badge variant="success">{attended} of {regs.length} checked in</Badge></div>}
        </CardContent>
      </Card>
    </div>
  )
}
