import { cn } from '@/lib/utils'

type BadgeVariant = 'orange' | 'teal' | 'yellow' | 'red' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const VARIANTS: Record<BadgeVariant, string> = {
  orange: 'bg-orange-100 text-orange-600',
  teal:   'bg-teal-light text-teal-dark',
  yellow: 'bg-yellow-50 text-yellow-700',
  red:    'bg-red-50 text-red-500',
  gray:   'bg-gray-100 text-gray-500',
}

export default function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('text-[0.6rem] font-mono px-2 py-0.5 rounded', VARIANTS[variant], className)}>
      {children}
    </span>
  )
}
