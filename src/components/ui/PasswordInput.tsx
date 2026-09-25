'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * A password field with an eye button that shows what was typed, so a typo is
 * caught before the form is sent rather than after a failed sign-in.
 *
 * The button is type="button" so it never submits the form, and it keeps
 * aria-pressed and its label in step with what it will do next.
 */
export default function PasswordInput({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`input pr-11 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:text-brand-600"
      >
        {visible ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
      </button>
    </div>
  )
}
