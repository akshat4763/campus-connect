export type Role = 'student' | 'clubAdmin' | 'superAdmin'

export interface Club {
  _id: string
  name: string
  description?: string
  logo?: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  club?: Club | null
  avatar?: string
  createdAt?: string
}

export interface EventItem {
  _id: string
  title: string
  description: string
  image?: string
  date: string
  time: string
  venue: string
  category: string
  club: Club
  maxSeats: number
  registeredCount: number
}

export interface Registration {
  _id: string
  ticketId: string
  attended: boolean
  createdAt: string
  user: User
  event: EventItem
}
