import { redirect } from 'next/navigation'

export default function Home() {
  // Simple redirect to login - middleware will handle authenticated users
  redirect('/admin/login')
}
