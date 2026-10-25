import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

export const Spinner = ({ className }: { className?: string }) => <Loader2 className={cn('h-5 w-5 animate-spin', className)} />
export const PageSpinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-primary"><Spinner className="h-8 w-8" /></div>
)
