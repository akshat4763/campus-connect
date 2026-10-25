import * as React from 'react'
import { cn } from '@/utils/helpers'

// Native <select> styled like shadcn — dependable on mobile and zero extra dependencies
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-full border border-input bg-white/[0.04] px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Select.displayName = 'Select'
