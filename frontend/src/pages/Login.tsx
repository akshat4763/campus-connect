import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/store/auth'
import { errMsg } from '@/utils/api'
import { homeFor } from '@/utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') })
type FV = z.infer<typeof schema>

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={homeFor(user.role)} replace />

  const onSubmit = async (v: FV) => {
    try {
      const u = await login(v.email, v.password)
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`)
      navigate(from && u.role === 'student' ? from : homeFor(u.role), { replace: true })
    } catch (e) { toast.error(errMsg(e, 'Login failed')) }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in to register for events and manage your tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@college.edu" {...register('email')} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register('password')} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Spinner className="h-4 w-4" />} Login</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">No account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
