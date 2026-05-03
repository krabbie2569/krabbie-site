import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold rounded-lg transition-colors duration-150 font-sans disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    outline: 'bg-transparent border-2 border-krabbie-border hover:border-orange-500 hover:text-orange-500 text-krabbie-dark',
    ghost:   'bg-transparent hover:bg-orange-50 text-orange-500',
    danger:  'bg-red-500 hover:bg-red-600 text-white',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          กำลังโหลด...
        </span>
      ) : children}
    </button>
  )
}
