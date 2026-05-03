'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn, isPastDate } from '@/lib/utils'

interface Props {
  selected: string | null   // YYYY-MM-DD
  onSelect: (date: string) => void
  maxAdvanceDays?: number
}

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function CalendarPicker({ selected, onSelect, maxAdvanceDays = 30 }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date())

  const today     = startOfDay(new Date())
  const maxDate   = addMonths(today, Math.ceil(maxAdvanceDays / 30))
  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start of month with empty cells
  const startPad = getDay(monthStart)  // 0=Sun

  function isDisabled(date: Date) {
    return isBefore(date, today)
  }

  return (
    <div>
      <div className="sec-label mb-3">เลือกวันที่</div>
      <div className="card p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMonth(prev => subMonths(prev, 1))}
            className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
          >
            ‹
          </button>
          <span className="font-syne font-bold text-sm">
            {format(viewMonth, 'LLLL yyyy', { locale: th })}
          </span>
          <button
            onClick={() => setViewMonth(prev => addMonths(prev, 1))}
            className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
          >
            ›
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center font-mono text-[0.6rem] text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty padding */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr   = format(day, 'yyyy-MM-dd')
            const disabled  = isDisabled(day)
            const isSelected = selected === dateStr
            const isToday   = isSameDay(day, today)

            return (
              <button
                key={dateStr}
                disabled={disabled}
                onClick={() => onSelect(dateStr)}
                className={cn(
                  'h-8 w-full rounded-lg text-xs font-mono transition-all',
                  disabled    ? 'text-gray-200 cursor-not-allowed' :
                  isSelected  ? 'bg-orange-500 text-white font-bold' :
                  isToday     ? 'border-2 border-orange-300 text-orange-500 hover:bg-orange-50' :
                  'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
