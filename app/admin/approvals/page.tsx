'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, Download, Check, X, Calendar, Eye, FileText, Clock } from 'lucide-react'

export default function ApprovalsPage() {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [approvalRequests, setApprovalRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/registrations')
      if (response.ok) {
        const data = await response.json()
        // Store raw data with ALL database fields
        setRawData(data)
        // Transform to match UI format
        const transformed = data.map((reg: any) => {
          // Determine courses display based on courseName
          // courseName will be "ALL_MIDTERMS", "ALL_FINALS", NULL, or specific course name
          let courses: string[] = []
          if (reg.courseName === 'ALL_MIDTERMS' || reg.courseName === 'ALL_FINALS' || !reg.courseName) {
            courses = [] // Empty for all midterm/final or NULL (as per UI requirement)
          } else if (reg.courseName) {
            courses = [reg.courseName]
          }

          const rejectedDateValue = reg.rejectedAt ? new Date(reg.rejectedAt).toLocaleDateString() : undefined
          const approvedDateValue = reg.approvedAt ? new Date(reg.approvedAt).toLocaleDateString() : undefined
          
          return {
            id: reg.id,
            studentId: reg.studentId,
            studentName: reg.student?.fullName || 'Unknown',
            email: `${reg.studentId}@siu.edu.so`,
            department: reg.student?.department || 'N/A',
            class: reg.student?.department || 'N/A',
            semester: reg.student?.semester || 'N/A',
            examType: reg.examType || 'N/A',
            courses: courses,
            reason: reg.reason,
            submittedDate: new Date(reg.createdAt).toLocaleDateString(),
            submittedTime: new Date(reg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: reg.approvalStatus,
            priority: reg.approvalStatus === 'PENDING' ? 'MEDIUM' : 'LOW',
            approvedBy: reg.approvedBy || undefined,
            approvedDate: approvedDateValue,
            rejectedBy: reg.rejectedBy || undefined,
            rejectedDate: rejectedDateValue,
            rejectionReason: reg.rejectionReason || undefined,
          }
        })
        setApprovalRequests(transformed)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterDepartment, setFilterDepartment] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [rawData, setRawData] = useState<any[]>([]) // Store raw data with all fields

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin' }), // In real app, get from auth
      })

      if (response.ok) {
        // Refresh data after approval
        await fetchApprovals()
      } else {
        alert('Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    }
  }

  const handleApproveAll = async () => {
    const pendingRequests = approvalRequests.filter(r => r.status === 'PENDING')
    
    if (pendingRequests.length === 0) {
      alert('No pending requests to approve')
      return
    }

    if (!confirm(`Are you sure you want to approve all ${pendingRequests.length} pending requests?`)) {
      return
    }

    try {
      setIsLoading(true)
      // Approve all pending requests in parallel
      const approvePromises = pendingRequests.map(request =>
        fetch(`/api/registrations/${request.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approvedBy: 'admin' }), // In real app, get from auth
        })
      )

      const results = await Promise.all(approvePromises)
      const failed = results.filter(r => !r.ok).length

      if (failed === 0) {
        alert(`Successfully approved ${pendingRequests.length} request(s)`)
        // Refresh data after approval
        await fetchApprovals()
      } else {
        alert(`Approved ${pendingRequests.length - failed} request(s), but ${failed} failed`)
        // Refresh data anyway to show updated status
        await fetchApprovals()
      }
    } catch (error) {
      console.error('Error approving all requests:', error)
      alert('Failed to approve all requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = (id: string) => {
    setSelectedRequest(id)
    setShowRejectModal(true)
  }

  const handleViewDetails = (id: string) => {
    setSelectedRequest(id)
    setShowDetailsModal(true)
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // UI only - no actual rejection logic
    console.log('Reject request (UI only)', selectedRequest, rejectReason)
    setShowRejectModal(false)
    setRejectReason('')
    setSelectedRequest(null)
  }

  const handleExportReport = () => {
    if (rawData.length === 0) {
      alert('No data to export')
      return
    }

    // Format date for Excel (YYYY-MM-DD HH:MM:SS)
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch {
        return dateStr
      }
    }

    // Format exam scope for better readability
    const formatExamScope = (scope: string) => {
      if (!scope) return ''
      const map: Record<string, string> = {
        'ALL_MIDTERM': 'All Midterms',
        'ALL_FINAL': 'All Finals',
        'SPECIFIC': 'Specific Courses'
      }
      return map[scope] || scope
    }

    // Format course name for better readability
    const formatCourseName = (courseName: string | null, examScope: string) => {
      if (!courseName) {
        if (examScope === 'ALL_MIDTERM') return 'All Midterms'
        if (examScope === 'ALL_FINAL') return 'All Finals'
        return ''
      }
      return courseName
    }

    // Organized headers - Most important first, grouped logically
    const headers = [
      // Student Information (Most Important)
      'Student ID',
      'Student Full Name',
      'Student Department',
      'Student Class',
      'Student Semester',
      'Student Shift',
      // Exam Information
      'Exam Scope',
      'Course Name',
      'Exam Type',
      'Reason for Request',
      // Registration Information
      'Registration ID',
      'Form Name',
      'Form Type',
      'Registration Date',
      // Approval Information
      'Approval Status',
      'Approved By',
      'Approved Date',
      'Rejected By',
      'Rejected Date',
      'Rejection Reason',
      // Additional Information
      'Form Start Date',
      'Form End Date',
      'Last Updated',
    ]

    // Map all fields from raw data in organized order
    const rows = rawData.map((reg: any) => [
      // Student Information
      reg.studentId || '',
      reg.studentFullName || '',
      reg.studentDepartment || '',
      reg.studentClassName || '',
      reg.studentSemester || '',
      reg.studentShift || '',
      // Exam Information
      formatExamScope(reg.examScope || ''),
      formatCourseName(reg.courseName, reg.examScope || ''),
      reg.examType || '',
      reg.reason || '',
      // Registration Information
      reg.id || '',
      reg.formName || '',
      reg.formType || '',
      formatDate(reg.createdAt),
      // Approval Information
      reg.approvalStatus || '',
      reg.approvedBy || '',
      formatDate(reg.approvedAt),
      reg.rejectedBy || '',
      formatDate(reg.rejectedAt),
      reg.rejectionReason || '',
      // Additional Information
      reg.formStartDate ? formatDate(reg.formStartDate) : '',
      reg.formEndDate ? formatDate(reg.formEndDate) : '',
      formatDate(reg.updatedAt),
    ])

    // Escape CSV values properly for Excel
    const escapeCSV = (cell: any) => {
      if (cell === null || cell === undefined || cell === '') return ''
      const str = String(cell)
      // Always quote if contains comma, quote, newline, or tab
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes('\t')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Create CSV content with BOM for Excel compatibility
    const csvContent = [
      '\uFEFF', // BOM for Excel UTF-8 encoding
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const fileName = `approvals-report-${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      case 'PENDING':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700'
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-700'
      case 'LOW':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredRequests = approvalRequests.filter((request) => {
    const matchesStatus = filterStatus === 'ALL' || request.status === filterStatus
    const matchesDepartment = filterDepartment === 'ALL' || request.department === filterDepartment
    const matchesSearch = 
      searchQuery === '' ||
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesDepartment && matchesSearch
  })

  const pendingCount = approvalRequests.filter(r => r.status === 'PENDING').length
  const approvedCount = approvalRequests.filter(r => r.status === 'APPROVED').length
  const rejectedCount = approvalRequests.filter(r => r.status === 'REJECTED').length

  const selectedRequestData = approvalRequests.find(r => r.id === selectedRequest)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approvals Management</h1>
            <p className="text-gray-600 mt-1">Review and approve special exam registration requests.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleApproveAll}
              disabled={isLoading || approvalRequests.filter(r => r.status === 'PENDING').length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Check className="w-5 h-5" />
              Approve All
            </button>
            <button 
              onClick={handleExportReport}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{pendingCount}</span>
            </div>
            <h3 className="text-sm text-gray-600">Pending Approvals</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{approvedCount}</span>
            </div>
            <h3 className="text-sm text-gray-600">Approved</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{rejectedCount}</span>
            </div>
            <h3 className="text-sm text-gray-600">Rejected</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{approvalRequests.length}</span>
            </div>
            <h3 className="text-sm text-gray-600">Total Requests</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Engineering">Engineering</option>
              <option value="Economics">Economics</option>
              <option value="Law">Law</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Date range..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REQUEST ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STUDENT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FACULTY/CLASS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EXAM TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRIORITY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUBMITTED
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                        <div className="text-sm text-gray-500">{request.studentId}</div>
                        <div className="text-xs text-gray-400">{request.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{request.department}</div>
                        <div className="text-sm text-gray-500">{request.class} • {request.semester}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {request.examType}
                        </span>
                        {request.courses.length > 0 ? (
                          <div className="text-xs text-gray-500 mt-1">{request.courses.length} course(s)</div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-1">—</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{request.submittedDate}</div>
                        <div className="text-xs text-gray-500">{request.submittedTime}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(request.status)}`}></div>
                        <span className={`text-sm font-medium ${getStatusBadge(request.status).split(' ')[1]}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(request.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {approvalRequests.length} requests
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRequestData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedRequest(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Student Name</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Student ID</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Department</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.department}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Class</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.class}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Semester</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.semester}</p>
                  </div>
                </div>
              </div>

              {/* Exam Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Exam Information</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">Exam Type</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.examType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Courses ({selectedRequestData.courses.length})</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRequestData.courses.map((course, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reason for Request</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRequestData.reason}</p>
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Submitted Date</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.submittedDate} at {selectedRequestData.submittedTime}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Request ID</label>
                    <p className="text-sm font-medium text-gray-900">{selectedRequestData.id}</p>
                  </div>
                </div>
              </div>

              {/* Approval/Rejection Info */}
              {selectedRequestData.status === 'APPROVED' && selectedRequestData.approvedBy && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Approved</h4>
                  <p className="text-sm text-green-700">
                    By {selectedRequestData.approvedBy} on {selectedRequestData.approvedDate}
                  </p>
                </div>
              )}

              {selectedRequestData.status === 'REJECTED' && selectedRequestData.rejectedBy && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Rejected</h4>
                  <p className="text-sm text-red-700 mb-2">
                    By {selectedRequestData.rejectedBy} on {selectedRequestData.rejectedDate}
                  </p>
                  {selectedRequestData.rejectionReason && (
                    <p className="text-sm text-red-600">
                      <strong>Reason:</strong> {selectedRequestData.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequestData.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleReject(selectedRequestData.id)
                      setShowDetailsModal(false)
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequestData.id)
                      setShowDetailsModal(false)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Request</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this student's request.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                    setSelectedRequest(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
