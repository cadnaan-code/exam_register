'use client'

import { Moon, CheckCircle2, HelpCircle } from 'lucide-react'
import Logo from '@/components/Logo'

export default function RegistrationSuccessPage({ params }: { params: { formId: string } }) {

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gray-600">EXAM REGISTRATION SYSTEM</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Moon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your <span className="font-semibold underline">Special Exam</span> application has been successfully received.
          </p>

          {/* Registration Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">REGISTRATION ID</div>
              <div className="text-xl font-bold text-primary">#SIU-EXM-49202</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">SUBMISSION DATE</div>
              <div className="text-xl font-bold text-gray-900">May 14, 2024 | 14:22 PM</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">SYSTEM IS ONLINE</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              KNOWLEDGE, SKILL & CHARACTER
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact the FECT support office{' '}
              <a href="mailto:fect_fa@siu.edu.so" className="text-primary hover:underline">
                fect_fa@siu.edu.so
              </a>
              {' '}or call 0613999945
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
