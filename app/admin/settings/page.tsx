'use client'

import AdminLayout from '@/components/admin/AdminLayout'

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">System settings and configuration (UI placeholder)</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">This page will be implemented with backend integration.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
