import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import EventDetail from '@/pages/EventDetail'
import MyRegistrations from '@/pages/MyRegistrations'
import Profile from '@/pages/Profile'
import ClubDashboard from '@/pages/club/Dashboard'
import EventForm from '@/pages/club/EventForm'
import EventRegistrations from '@/pages/club/EventRegistrations'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminClubs from '@/pages/admin/Clubs'
import AdminUsers from '@/pages/admin/Users'
import AdminEvents from '@/pages/admin/Events'

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6 md:py-8"><Outlet /></main>
    </div>
  )
}

export default function App() {
  const init = useAuth((s) => s.init)
  useEffect(() => { init() }, [init])

  const admins = ['clubAdmin', 'superAdmin'] as const
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/my-registrations" element={<MyRegistrations />} />
        </Route>

        <Route element={<ProtectedRoute roles={['clubAdmin']} />}>
          <Route path="/club/dashboard" element={<ClubDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={[...admins]} />}>
          <Route path="/club/events/create" element={<EventForm />} />
          <Route path="/club/events/edit/:id" element={<EventForm />} />
          <Route path="/club/events/:id/registrations" element={<EventRegistrations />} />
        </Route>

        <Route element={<ProtectedRoute roles={['superAdmin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clubs" element={<AdminClubs />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/events" element={<AdminEvents />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
