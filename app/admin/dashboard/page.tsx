'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { Users, FileCheck, CheckCircle2, Eye } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingApprovals: 0,
    activeForms: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        // No session, redirect to login
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      if (!data.user) {
        // No user data, redirect to login
        router.push('/admin/login')
        return
      }
      // User is authenticated, fetch dashboard data
      setIsCheckingAuth(false)
      fetchDashboardData()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      // Fetch registrations
      const regResponse = await fetch('/api/registrations')
      const registrations = regResponse.ok ? await regResponse.json() : []
      
      // Fetch forms
      const formsResponse = await fetch('/api/registration-forms')
      const forms = formsResponse.ok ? await formsResponse.json() : []

      // Calculate stats
      const totalRegistrations = registrations.length
      const pendingApprovals = registrations.filter((r: any) => r.approvalStatus === 'PENDING').length
      const activeForms = forms.filter((f: any) => f.isOpen).length

      setStats({
        totalRegistrations,
        pendingApprovals,
        activeForms,
      })

      // Get recent registrations (last 5)
      const recent = registrations
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((reg: any) => ({
          id: reg.studentId,
          name: reg.student?.fullName || 'Unknown',
          initials: (reg.student?.fullName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          course: (reg.courseName === 'ALL_MIDTERMS' || reg.courseName === 'ALL_FINALS' || !reg.courseName) ? '' : reg.courseName,
          date: new Date(reg.createdAt).toLocaleDateString(),
          status: reg.approvalStatus,
          statusColor: reg.approvalStatus === 'APPROVED' 
            ? 'bg-green-100 text-green-700' 
            : reg.approvalStatus === 'REJECTED'
            ? 'bg-red-100 text-red-700'
            : 'bg-orange-100 text-orange-700',
        }))
      
      setRecentRegistrations(recent)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statsData = [
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      tag: stats.pendingApprovals > 0 ? 'High' : undefined,
      tagColor: 'bg-red-500',
      icon: FileCheck,
      color: 'bg-orange-500',
    },
    {
      title: 'Active Form Status',
      value: stats.activeForms > 0 ? 'OPEN' : 'CLOSED',
      valueType: 'status' as const,
      statusColor: stats.activeForms > 0 ? 'text-green-600' : 'text-red-600',
      icon: CheckCircle2,
      color: 'bg-green-500',
    },
  ]

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin. Here is what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.tag && (
                    <span className={`text-xs px-2 py-1 rounded ${stat.tagColor} text-white`}>
                      {stat.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
                {stat.valueType === 'status' ? (
                  <p className={`text-2xl font-bold ${stat.statusColor}`}>{stat.value}</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Registrations */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Student Registrations</h2>
              <Link href="/admin/student-requests" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STUDENT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COURSE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading registrations...
                      </td>
                    </tr>
                  ) : recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No recent registrations found.
                      </td>
                    </tr>
                  ) : (
                    recentRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {registration.initials}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {registration.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{registration.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{registration.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${registration.statusColor}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">+</span>
                    </div>
                    <span className="font-medium text-gray-900">Create New Form</span>
                  </div>
                  <span>→</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white">↓</span>
                    </div>
                    <span className="font-medium text-gray-900">Export Today's List</span>
                  </div>
                  <span>→</span>
                </button>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🔒</span>
                      </div>
                      <span className="font-medium text-gray-900">Registration Status: OPEN</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span>⚙️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">i</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    The system is performing optimally.
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Next scheduled maintenance: <span className="underline">Sunday, 00:00 AM</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Backup: 4h ago
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">v2.4.1</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
