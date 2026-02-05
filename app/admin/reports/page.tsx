'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Download, FileText, Search, Moon, TrendingUp, Clock, Users } from 'lucide-react'

export default function ReportsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [allRegistrations, setAllRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [department, setDepartment] = useState('All Departments')
  const [examTypes, setExamTypes] = useState({
    special: true,
    resit: true,
    improvement: false,
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/registrations')
      if (response.ok) {
        const data = await response.json()
        // Transform to match UI format
        const transformed = data.map((reg: any) => {
          // Determine course display based on courseName
          // courseName will be "ALL_MIDTERMS", "ALL_FINALS", NULL, or specific course name
          let courseDisplay = ''
          if (reg.courseName === 'ALL_MIDTERMS' || reg.courseName === 'ALL_FINALS' || !reg.courseName) {
            courseDisplay = '' // Empty for all midterm/final or NULL (as per UI requirement)
          } else if (reg.courseName) {
            courseDisplay = reg.courseName
          }

          return {
            id: reg.studentId,
            name: reg.student?.fullName || 'Unknown',
            department: reg.student?.department || 'N/A',
            course: courseDisplay,
            examType: reg.examType || 'Special',
            status: reg.approvalStatus,
            createdAt: reg.createdAt,
          }
        })
        setAllRegistrations(transformed)
        setRegistrations(transformed)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique departments from data
  const uniqueDepartments = Array.from(new Set(allRegistrations
    .filter((r: any) => r.department !== 'N/A')
    .map((r: any) => r.department)
  )).sort()

  // Apply filters when component mounts or when filters change
  useEffect(() => {
    if (allRegistrations.length === 0) return

    let filtered = [...allRegistrations]

    // Date range filter
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'Last 90 Days':
        startDate.setDate(now.getDate() - 90)
        break
      case 'This Year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'Custom Range':
        // For now, show all data (can be enhanced later)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    if (dateRange !== 'Custom Range') {
      filtered = filtered.filter((reg: any) => {
        if (!reg.createdAt) return false
        const regDate = new Date(reg.createdAt)
        return regDate >= startDate && regDate <= now
      })
    }

    // Department filter
    if (department !== 'All Departments') {
      filtered = filtered.filter((reg: any) => reg.department === department)
    }

    // Exam type filter
    const selectedExamTypes: string[] = []
    if (examTypes.special) selectedExamTypes.push('Special', 'MIDTERM', 'FINAL')
    if (examTypes.resit) selectedExamTypes.push('RESIT')
    if (examTypes.improvement) selectedExamTypes.push('IMPROVEMENT')

    if (selectedExamTypes.length > 0) {
      filtered = filtered.filter((reg: any) => {
        const examType = reg.examType || 'Special'
        return selectedExamTypes.some(type => 
          examType.toUpperCase().includes(type.toUpperCase())
        )
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((reg: any) => 
        reg.id?.toLowerCase().includes(query) ||
        reg.name?.toLowerCase().includes(query) ||
        reg.department?.toLowerCase().includes(query) ||
        reg.course?.toLowerCase().includes(query)
      )
    }

    setRegistrations(filtered)
    setCurrentPage(1) // Reset to first page when filters are applied
  }, [dateRange, department, examTypes, searchQuery, allRegistrations])

  // Filter function for manual apply button
  const applyFilters = () => {
    // The useEffect will handle the filtering automatically
    // This function is kept for the button onClick
  }

  // Calculate metrics from filtered data
  const totalRegistrations = registrations.length
  const pendingApprovals = registrations.filter((r: any) => r.status === 'PENDING').length
  const uniqueCourses = new Set(registrations.filter((r: any) => r.course && r.course !== '').map((r: any) => r.course)).size
  
  // Calculate top department from filtered data
  const departmentCounts = registrations.reduce((acc: any, reg: any) => {
    if (reg.department !== 'N/A') {
      acc[reg.department] = (acc[reg.department] || 0) + 1
    }
    return acc
  }, {})
  const topDepartment = Object.entries(departmentCounts).sort((a: any, b: any) => b[1] - a[1])[0]
  const topDepartmentName = topDepartment ? topDepartment[0] : 'N/A'
  const topDepartmentCount = topDepartment ? topDepartment[1] : 0

  // Calculate peak time (day of week with most registrations) from filtered data
  const dayCounts = registrations.reduce((acc: any, reg: any) => {
    if (reg.createdAt) {
      const date = new Date(reg.createdAt)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      acc[dayName] = (acc[dayName] || 0) + 1
    }
    return acc
  }, {})
  const peakDay = Object.entries(dayCounts).sort((a: any, b: any) => b[1] - a[1])[0]
  const peakDayName = peakDay ? peakDay[0] : 'N/A'
  const peakTime = peakDay ? '10:00 AM' : 'N/A' // Default time, can be enhanced with actual time analysis

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(registrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRegistrations = registrations.slice(startIndex, endIndex)

  // Export to CSV
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No data to export')
      return
    }

    // Match table headers exactly
    const headers = ['Student ID', 'Full Name', 'Department', 'Course', 'Exam Type', 'Status']
    const rows = registrations.map((reg: any) => [
      reg.id || '',
      reg.name || '',
      reg.department || '',
      reg.course || '',
      reg.examType || '',
      reg.status || '',
    ])

    // Escape commas and quotes in CSV
    const escapeCSV = (cell: string) => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCSV(String(cell))).join(','))
    ].join('\n')

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export to PDF
  const exportToPDF = () => {
    // Create a simple PDF using window.print or jsPDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to export PDF')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Registration Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            @media print { @page { size: landscape; } }
          </style>
        </head>
        <body>
          <h1>Registration Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Registrations: ${registrations.length}</p>
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Course</th>
                <th>Exam Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${registrations.map((reg: any) => `
                <tr>
                  <td>${reg.id || ''}</td>
                  <td>${reg.name || ''}</td>
                  <td>${reg.department || ''}</td>
                  <td>${reg.course || ''}</td>
                  <td>${reg.examType || ''}</td>
                  <td>${reg.status || ''}</td>
                  <td>${reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administrative Reports</h1>
            <p className="text-gray-600 mt-1">Manage and export special exam registration data.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Moon className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button 
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Registrations</h3>
            <p className="text-3xl font-bold text-gray-900">{totalRegistrations.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                {pendingApprovals} Pending
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Pending Approvals</h3>
            <p className="text-3xl font-bold text-gray-900">{pendingApprovals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                All Departments
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Active Courses</h3>
            <p className="text-3xl font-bold text-gray-900">{uniqueCourses}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔍</span>
              Report Filters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option>All Departments</option>
                  {uniqueDepartments.map((dept: string) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examTypes.special}
                      onChange={(e) => setExamTypes({ ...examTypes, special: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Special Exam</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examTypes.resit}
                      onChange={(e) => setExamTypes({ ...examTypes, resit: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Resit Exam</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examTypes.improvement}
                      onChange={(e) => setExamTypes({ ...examTypes, improvement: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Improvement Exam</span>
                  </label>
                </div>
              </div>
              <button 
                onClick={applyFilters}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Registration Trends */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Medicine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Engineering</span>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Chart placeholder (UI only)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Top Department</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {topDepartmentName !== 'N/A' ? `${topDepartmentName} (${topDepartmentCount} Reg)` : 'No data'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Peak Time</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {peakDayName !== 'N/A' ? `${peakDayName} (${peakTime})` : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Registration Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Registration Preview</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Student ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading registrations...
                      </td>
                    </tr>
                  ) : currentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No registrations found.
                      </td>
                    </tr>
                  ) : (
                    currentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                          {reg.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reg.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reg.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reg.course || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {reg.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reg.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-700' 
                            : reg.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {registrations.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, registrations.length)} of {registrations.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
