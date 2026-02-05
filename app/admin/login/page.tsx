'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [staySignedIn, setStaySignedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log('[Login] Response:', response.status, data)

      if (response.ok) {
        // Wait a moment for cookie to be set, then redirect
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 100)
      } else {
        const errorMessage = data.error || data.details || 'Login failed. Please try again.'
        console.error('[Login] Error:', errorMessage)
        setError(errorMessage)
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error('[Login] Network error:', error)
      setError(`Login failed: ${error?.message || 'Network error. Please check your connection.'}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={true} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Special Exam Registration System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Stay Signed In */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="staySignedIn"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="staySignedIn" className="ml-2 text-sm text-gray-700">
                Stay signed in for 30 days
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Secure Sign In'}
              {!isLoading && <span>→</span>}
            </button>

            {/* Encrypted Connection Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>ENCRYPTED CONNECTION</span>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            © 2024 All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-primary">System Status</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">IT Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
