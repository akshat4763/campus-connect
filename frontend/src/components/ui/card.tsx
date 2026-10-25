import * as React from 'react'
import { cn } from '@/utils/helpers'

type DivProps = React.HTMLAttributes<HTMLDivElement>
export const Card = ({ className, ...p }: DivProps) => <div className={cn('rounded-2xl border bg-card text-card-foreground', className)} {...p} />
export const CardHeader = ({ className, ...p }: DivProps) => <div className={cn('flex flex-col space-y-1.5 p-5', className)} {...p} />
export const CardTitle = ({ className, ...p }: DivProps) => <h3 className={cn('text-lg font-semibold leading-tight tracking-tight', className)} {...p} />
export const CardDescription = ({ className, ...p }: DivProps) => <p className={cn('text-sm text-muted-foreground', className)} {...p} />
export const CardContent = ({ className, ...p }: DivProps) => <div className={cn('p-5 pt-0', className)} {...p} />
export const CardFooter = ({ className, ...p }: DivProps) => <div className={cn('flex items-center p-5 pt-0', className)} {...p} />
