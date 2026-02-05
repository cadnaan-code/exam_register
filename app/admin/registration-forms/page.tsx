'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Copy, Pencil, Search, Filter } from 'lucide-react'

export default function RegistrationFormsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [newFormType, setNewFormType] = useState('Special Exam')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [forms, setForms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeForms: 0,
    totalSubmissions: 0,
    closedForms: 0,
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/registration-forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
        
        // Calculate stats from database
        const activeForms = data.filter((form: any) => form.status === 'OPEN' || form.isOpen).length
        const closedForms = data.filter((form: any) => form.status === 'CLOSED' || !form.isOpen).length
        const totalSubmissions = data.reduce((sum: number, form: any) => {
          return sum + (form.totalSubmissions || 0)
        }, 0)
        
        setStats({
          activeForms,
          totalSubmissions,
          closedForms,
        })
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleToggleStatus = async (formId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    
    // Optimistic update - update UI immediately
    setForms(prevForms => 
      prevForms.map(form => 
        form.id === formId 
          ? { ...form, isOpen: newStatus, status: newStatus ? 'OPEN' : 'CLOSED' }
          : form
      )
    )
    
    // Update stats immediately
    setStats(prevStats => {
      if (newStatus) {
        return {
          ...prevStats,
          activeForms: prevStats.activeForms + 1,
          closedForms: prevStats.closedForms - 1,
        }
      } else {
        return {
          ...prevStats,
          activeForms: prevStats.activeForms - 1,
          closedForms: prevStats.closedForms + 1,
        }
      }
    })

    try {
      const response = await fetch('/api/registration-forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId,
          isOpen: newStatus,
        }),
      })

      if (!response.ok) {
        // Revert on error
        const error = await response.json()
        alert(error.error || 'Failed to update form status')
        // Revert the optimistic update
        await fetchForms()
      }
    } catch (error) {
      console.error('Error toggling form status:', error)
      alert('Failed to update form status. Please try again.')
      // Revert the optimistic update
      await fetchForms()
    }
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFormName.trim()) {
      alert('Please enter a registration form name')
      return
    }

    try {
      const response = await fetch('/api/registration-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFormName,
          type: newFormType,
          description: '',
        }),
      })

      if (response.ok) {
        // Refresh forms list
        await fetchForms()
        setShowCreateModal(false)
        setNewFormName('')
        setNewFormType('Special Exam')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(errorData.error || 'Failed to create form. Please check the console for details.')
      }
    } catch (error) {
      console.error('Error creating form:', error)
      alert('Failed to create form. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Registration Forms</h1>
            <p className="text-gray-600 mt-1">Create and monitor special exam registration portals.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Active Forms</p>
                <p className="text-4xl font-bold">{stats.activeForms}</p>
              </div>
              <div className="text-blue-300 opacity-50">
                <span className="text-4xl">≡</span>
              </div>
            </div>
          </div>
          <div className="bg-green-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Submissions</p>
                <p className="text-4xl font-bold">{stats.totalSubmissions.toLocaleString()}</p>
              </div>
              <div className="text-green-300 opacity-50">
                <span className="text-4xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Closed Forms</p>
                <p className="text-4xl font-bold">{stats.closedForms}</p>
              </div>
              <div className="text-gray-400 opacity-50">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search forms by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>All Types</option>
              <option>Special Exam</option>
              <option>Clearance Exam</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Sort By: Newest</option>
              <option>Sort By: Oldest</option>
              <option>Sort By: Name</option>
            </select>
          </div>
        </div>

        {/* Forms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REGISTRATION NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DIRECT LINK
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
                      Loading forms...
                    </td>
                  </tr>
                ) : forms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No registration forms found. Create your first form to get started.
                    </td>
                  </tr>
                ) : (
                  forms.map((form) => {
                    const formLink = form.isOpen 
                      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register/${form.id}`
                      : null
                    const formType = form.formType === 'SPECIAL_EXAM' ? 'Special Exam' 
                      : form.formType === 'CLEARANCE_EXAM' ? 'Clearance Exam'
                      : form.formType === 'ADMINISTRATIVE' ? 'Administrative'
                      : form.formType === 'RESIT_EXAM' ? 'Resit Exam'
                      : form.formType === 'IMPROVEMENT_EXAM' ? 'Improvement Exam'
                      : form.formType
                    const createdDate = new Date(form.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                    
                    return (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{form.formName}</div>
                            <div className="text-sm text-gray-500">
                              Created on {createdDate}
                              {form.endDate && (
                                <span className="ml-3">
                                  • Ends: {new Date(form.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            formType === 'Special Exam' 
                              ? 'bg-blue-100 text-blue-700' 
                              : formType === 'Clearance Exam'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {formType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(form.id, form.isOpen)}
                              className={`relative inline-block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                form.isOpen ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              title={form.isOpen ? 'Click to close' : 'Click to open'}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                form.isOpen ? 'translate-x-6' : 'translate-x-0'
                              }`}></div>
                            </button>
                            <span className={`text-sm font-medium ${
                              form.isOpen ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {form.isOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {formLink ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 font-mono">{formLink}</span>
                              <button
                                onClick={() => handleCopyLink(formLink)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Link hidden while closed</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing 1 to 3 of 57 entries
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                ←
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Registration Form</h2>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Name
                </label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g. Final Semester Special Exam 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type
                </label>
                <select
                  value={newFormType}
                  onChange={(e) => setNewFormType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option>Special Exam</option>
                  <option>Clearance Exam</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Create Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
