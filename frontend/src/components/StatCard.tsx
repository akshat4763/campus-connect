import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-accent-foreground"><Icon className="h-6 w-6" /></div>
      </CardContent>
    </Card>
  )
}
