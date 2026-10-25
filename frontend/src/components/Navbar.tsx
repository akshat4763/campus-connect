import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/utils/helpers'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links: { to: string; label: string }[] = [{ to: '/', label: 'Events' }]
  if (user?.role === 'student') links.push({ to: '/my-registrations', label: 'My Tickets' })
  if (user?.role === 'clubAdmin') links.push({ to: '/club/dashboard', label: 'Dashboard' }, { to: '/club/events/create', label: 'Create Event' })
  if (user?.role === 'superAdmin')
    links.push({ to: '/admin/dashboard', label: 'Dashboard' }, { to: '/admin/clubs', label: 'Clubs' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/events', label: 'All Events' })

  const handleLogout = () => { logout(); setOpen(false); navigate('/login') }
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground', isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground')

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><CalendarDays className="h-5 w-5" /></span>
          CampusConnect
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end className={linkCls}>{l.label}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                <Avatar src={user.avatar} name={user.name} />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Login</Link>
              <Link to="/register" className={buttonVariants({ size: 'sm' })}>Sign up</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3" onClick={() => setOpen(false)}>
            {links.map((l) => <NavLink key={l.to} to={l.to} end className={linkCls}>{l.label}</NavLink>)}
            {user ? (
              <>
                <NavLink to="/profile" className={linkCls}>Profile ({user.name.split(' ')[0]})</NavLink>
                <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: 'outline' })}>Login</Link>
                <Link to="/register" className={buttonVariants()}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
