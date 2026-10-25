import { cn } from '@/utils/helpers'
export const Skeleton = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse rounded-md bg-white/[0.06]', className)} {...p} />
)
