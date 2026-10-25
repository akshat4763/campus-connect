import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/store/auth'
import { errMsg } from '@/utils/api'
import { homeFor } from '@/utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'At least 6 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })
type FV = z.infer<typeof schema>

export default function Register() {
  const { user, register: signup } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={homeFor(user.role)} replace />

  const onSubmit = async (v: FV) => {
    try {
      await signup(v.name, v.email, v.password)
      toast.success('Account created!')
      navigate('/', { replace: true })
    } catch (e) { toast.error(errMsg(e, 'Registration failed')) }
  }

  const field = (id: keyof FV, label: string, type = 'text') => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} {...register(id)} />
      {errors[id] && <p className="text-sm text-destructive">{errors[id]?.message}</p>}
    </div>
  )

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader><CardTitle className="text-2xl">Create account</CardTitle><CardDescription>Students sign up here. Club admins are assigned by the super admin.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {field('name', 'Full name')}
            {field('email', 'Email', 'email')}
            {field('password', 'Password', 'password')}
            {field('confirm', 'Confirm password', 'password')}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Spinner className="h-4 w-4" />} Sign up</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
