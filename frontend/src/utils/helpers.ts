import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Role } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h)) return t
  return `${((h + 11) % 12) + 1}:${String(m ?? 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export const homeFor = (role: Role) =>
  role === 'superAdmin' ? '/admin/dashboard' : role === 'clubAdmin' ? '/club/dashboard' : '/'

export const isPast = (d: string) => {
  const end = new Date(d)
  end.setHours(23, 59, 59, 999)
  return end < new Date()
}

export const CATEGORIES = ['Technical', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Social', 'Other']
