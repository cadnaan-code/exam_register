'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Copy, Check, X, Link2, Eye, Edit, Trash2, Power, Calendar, Users, FileText } from 'lucide-react'

export default function RegistrationControlPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Special Exam',
    startDate: '',
    endDate: '',
  })

  const [forms, setForms] = useState<any[]>([])

  // Fetch forms on mount
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
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/registration-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        await fetchForms()
        setShowCreateModal(false)
        setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create form')
      }
    } catch (error) {
      console.error('Error creating form:', error)
      alert('Failed to create form. Please try again.')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const form = forms.find(f => f.id === id)
      const newStatus = form?.status === 'OPEN' ? false : true
      const response = await fetch('/api/registration-forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isOpen: newStatus }),
      })
      if (response.ok) {
        await fetchForms()
      } else {
        alert('Failed to update form status')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Failed to update form status. Please try again.')
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleEdit = (id: string) => {
    const form = forms.find(f => f.id === id)
    if (form) {
      setFormData({
        name: form.name,
        description: form.description,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
      })
      setSelectedForm(id)
      setShowEditModal(true)
    }
  }

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedForm) {
      try {
        const response = await fetch('/api/registration-forms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedForm, ...formData }),
        })
        if (response.ok) {
          await fetchForms()
          setShowEditModal(false)
          setSelectedForm(null)
          setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
        } else {
          alert('Failed to update form')
        }
      } catch (error) {
        console.error('Error updating form:', error)
        alert('Failed to update form. Please try again.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this registration form?')) {
      try {
        const response = await fetch(`/api/registration-forms?id=${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchForms()
        } else {
          alert('Failed to delete form')
        }
      } catch (error) {
        console.error('Error deleting form:', error)
        alert('Failed to delete form. Please try again.')
      }
    }
  }

  const openCount = forms.filter(f => f.status === 'OPEN').length
  const closedCount = forms.filter(f => f.status === 'CLOSED').length
  const totalSubmissions = forms.reduce((sum, f) => sum + f.totalSubmissions, 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registration Control</h1>
            <p className="text-gray-600 mt-1">Create and manage registration forms. Generate shareable links for students.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{openCount}</span>
            </div>
            <h3 className="text-sm text-gray-600">Open Registrations</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Power className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{closedCount}</span>
            </div>
            <h3 className="text-sm text-gray-600">Closed Registrations</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalSubmissions}</span>
            </div>
            <h3 className="text-sm text-gray-600">Total Submissions</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{forms.length}</span>
            </div>
            <h3 className="text-sm text-gray-600">Total Forms</h3>
          </div>
        </div>

        {/* Registration Forms List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Registration Forms</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading forms...</p>
            </div>
          ) : (
          <div className="divide-y divide-gray-200">
            {forms.map((form) => (
              <div key={form.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        form.type === 'Special Exam' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {form.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          form.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          form.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {form.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{form.description}</p>
                    
                    {/* Registration Link */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Registration Link (Share with students)
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-gray-800 font-mono bg-white px-3 py-2 rounded border border-gray-200 flex-1">
                              {form.link}
                            </code>
                            <button
                              onClick={() => handleCopyLink(form.link)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Copy link"
                            >
                              {copiedLink === form.link ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-500">Total Submissions</label>
                        <p className="text-sm font-semibold text-gray-900">{form.totalSubmissions}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Active Submissions</label>
                        <p className="text-sm font-semibold text-gray-900">{form.activeSubmissions}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Start Date</label>
                        <p className="text-sm font-semibold text-gray-900">{form.startDate}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End Date</label>
                        <p className="text-sm font-semibold text-gray-900">{form.endDate}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(form.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                          form.status === 'OPEN'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        {form.status === 'OPEN' ? 'Close Registration' : 'Open Registration'}
                      </button>
                      <button
                        onClick={() => handleEdit(form.id)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <a
                        href={form.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Registration Form</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Final Semester Special Exam 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this registration form..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option>Special Exam</option>
                  <option>Administrative</option>
                  <option>Resit Exam</option>
                  <option>Improvement Exam</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A unique registration link will be generated automatically after creating this form. 
                  You can share this link with students for registration.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
                  }}
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

      {/* Edit Form Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Registration Form</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedForm(null)
                  setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option>Special Exam</option>
                  <option>Administrative</option>
                  <option>Resit Exam</option>
                  <option>Improvement Exam</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedForm(null)
                    setFormData({ name: '', description: '', type: 'Special Exam', startDate: '', endDate: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Update Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
