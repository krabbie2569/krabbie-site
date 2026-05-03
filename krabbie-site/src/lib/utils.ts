import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in Thai style: 150 → "150 ฿"
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('th-TH')} ฿`
}

// Format date in Thai: "จันทร์ที่ 5 พ.ค. 2569"
export function formatDateTH(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'EEEEที่ d MMM yyyy', { locale: th })
}

// Format short date: "5 พ.ค."
export function formatDateShortTH(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM', { locale: th })
}

// Format time: "14:30"
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

// Generate array of dates from today + maxDays
export function getAvailableDates(maxDays = 30): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: maxDays }, (_, i) => addDays(today, i))
}

// Sanitize subdomain input: lowercase, replace invalid chars with -
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

// Check if subdomain slug is valid
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(slug)
}

// Build shop URL
export function shopUrl(slug: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'krabbie.com'
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `http://localhost:3000?tenant=${slug}`
  }
  return `https://${slug}.${domain}`
}

// Duration in human-readable Thai: 90 → "1 ชั่วโมง 30 นาที"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} นาที`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} ชั่วโมง`
  return `${h} ชั่วโมง ${m} นาที`
}

// Is date in the past?
export function isPastDate(date: string): boolean {
  return isBefore(new Date(date), startOfDay(new Date()))
}

// Generate a booking reference code: KRB-XXXXXX
export function generateRef(): string {
  return 'KRB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}
