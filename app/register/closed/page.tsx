'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Mail, Phone, MapPin, HelpCircle, Moon } from 'lucide-react'
import Logo from '@/components/Logo'

export default function RegistrationClosedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Moon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-amber-50 rounded-2xl shadow-lg p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Registration Closed</h1>
            <p className="text-xl text-gray-700 font-medium">
              Diiwaangelinta Imtixaanka Gaarka ah ayaa hadda xidhan.
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Portal-ka diiwaangelinta Imtixaanka Gaarka ah ee fasalka waxbarashada hadda wuxuu gaadhay 
              muddadiisa ugu dambeysay oo ma sii aqbalo diiwaangelin cusub. Haddii aad u malaynayso in 
              khalad ay jirto ama aad muddadii ka dhaaftay, fadlan la xidhiidh Xafiiska Maamulaha FECT 
              si degdeg ah.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">MACLUUMAD XIRIIRKA</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-600">Iimaylka FECT</div>
                  <a 
                    href="mailto:fect_fa@siu.edu.so" 
                    className="text-primary hover:underline font-medium"
                  >
                    fect_fa@siu.edu.so
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-600">Lambarka Taleefanka</div>
                  <a 
                    href="tel:0613999945" 
                    className="text-gray-900 font-medium"
                  >
                    0613999945
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-600">Goobta Xafiiska</div>
                  <p className="text-gray-900 font-medium">
                    Xarunta FECT, Xafiiska Maamulaha ama Xafiiska Maamulaha Kuliyadda
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <div>Reference: SIU-REG-2024-CLOSED</div>
          <div>SIU PORTAL V2.4.1</div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          © 2024 All rights reserved.
        </div>
      </footer>
    </div>
  )
}
