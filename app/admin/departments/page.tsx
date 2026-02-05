'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, Filter, Download, Building2 } from 'lucide-react'

export default function DepartmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
  })
  const [totalDepartments, setTotalDepartments] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/departments')

      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
        setTotalDepartments(data.length)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a department name')
      return
    }

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowCreateModal(false)
        setFormData({ name: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create department')
      }
    } catch (error) {
      console.error('Error creating department:', error)
      alert('Failed to create department. Please try again.')
    }
  }

  const handleEditDepartment = (dept: any) => {
    setEditingDepartment(dept)
    setFormData({
      name: dept.name,
    })
    setShowEditModal(true)
  }

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    try {
      const response = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDepartment.id,
          name: formData.name.trim(),
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowEditModal(false)
        setEditingDepartment(null)
        setFormData({ name: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update department')
      }
    } catch (error) {
      console.error('Error updating department:', error)
      alert('Failed to update department. Please try again.')
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete department')
      }
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('Failed to delete department. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Departments</h1>
          <p className="text-gray-600 mt-1">
            Create and manage university departments. Departments are used to organize classes and students.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Register New Department */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Register New Department</h2>
              </div>
              <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Register Department
                </button>
              </form>
            </div>

            {/* Total Active Departments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Total Departments</p>
                  <p className="text-3xl font-bold text-gray-900">{totalDepartments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Existing Departments */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Existing Departments</h2>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DEPARTMENT NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CLASSES COUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE CREATED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading departments...
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No departments found. Create your first department to get started.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, index) => {
                      const createdDate = new Date(dept.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      return (
                        <tr key={dept.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">#DEPT-{String(1000 + index + 1).padStart(4, '0')}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {dept._count?.classes || 0} classes
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{createdDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditDepartment(dept)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(dept.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
                Showing 1 to {Math.min(10, departments.length)} of {departments.length} results
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">←</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Department</h2>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDepartment(null)
                    setFormData({ name: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
