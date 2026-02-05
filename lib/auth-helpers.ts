'use client'

import { useEffect, useState } from 'react'

export interface AdminUser {
  id: string
  username: string
  fullName: string
  userType: string
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { user, isLoading, logout, checkAuth }
}
