import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const errMsg = (e: unknown, fallback = 'Something went wrong') => {
  if (axios.isAxiosError(e)) return e.response?.data?.message || (e.code === 'ERR_NETWORK' ? 'Cannot reach the server' : fallback)
  return fallback
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('image', file)
  const { data } = await api.post('/upload', fd)
  return data.url as string
}
