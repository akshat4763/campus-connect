import { cn } from '@/utils/helpers'

export const Avatar = ({ src, name, className }: { src?: string; name: string; className?: string }) => (
  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground', className)}>
    {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
  </div>
)
