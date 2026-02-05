'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Main Logo Image */}
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/siu_logo.png"
          alt="Somali International University Logo"
          width={200}
          height={200}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Motto Text */}
      {showText && (
        <div className={`mt-3 text-center ${textSizes[size]}`}>
          <p className="text-primary font-semibold">Knowledge, Skills & Morality</p>
        </div>
      )}
    </div>
  )
}
