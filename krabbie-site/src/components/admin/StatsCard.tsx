import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string
  sub:   string
  color: 'orange' | 'teal' | 'yellow' | 'gray'
}

const COLORS = {
  orange: { bar: 'bg-orange-500', text: 'text-orange-500' },
  teal:   { bar: 'bg-teal-DEFAULT', text: 'text-teal-dark' },
  yellow: { bar: 'bg-yellow-400', text: 'text-yellow-600' },
  gray:   { bar: 'bg-gray-400', text: 'text-gray-500' },
}

export default function StatsCard({ label, value, sub, color }: Props) {
  const c = COLORS[color]
  return (
    <div className="bg-white rounded-krabbie border border-krabbie-border p-4 relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 w-1 h-full', c.bar)} />
      <div className="font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider mb-1 pl-1">{label}</div>
      <div className={cn('font-syne font-extrabold text-2xl leading-none pl-1', c.text)}>{value}</div>
      <div className="font-mono text-[0.65rem] text-gray-400 pl-1 mt-0.5">{sub}</div>
    </div>
  )
}
