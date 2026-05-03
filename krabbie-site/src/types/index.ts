import type { Database } from './database.types'

// ── Row shortcuts ──────────────────────────────────────────────────────────
export type Tenant    = Database['public']['Tables']['tenants']['Row']
export type Service   = Database['public']['Tables']['services']['Row']
export type Staff     = Database['public']['Tables']['staff']['Row']
export type TimeSlot  = Database['public']['Tables']['time_slots']['Row']
export type Booking   = Database['public']['Tables']['bookings']['Row']
export type Template  = Database['public']['Tables']['templates']['Row']
export type Payment   = Database['public']['Tables']['payments']['Row']

// ── Insert shortcuts ───────────────────────────────────────────────────────
export type NewTenant   = Database['public']['Tables']['tenants']['Insert']
export type NewBooking  = Database['public']['Tables']['bookings']['Insert']
export type NewPayment  = Database['public']['Tables']['payments']['Insert']

// ── Tenant settings (stored as JSON in tenants.settings) ──────────────────
export interface TenantSettings {
  primaryColor: string        // hex, default '#ff6b00'
  logoUrl: string | null
  lineId: string | null
  lineNotify: boolean
  pushEnabled: boolean
  businessHours: BusinessHours
  maxAdvanceDays: number      // how far in future customer can book
  autoConfirm: boolean        // auto confirm or require manual confirm
}

export interface BusinessHours {
  monday:    DayHours
  tuesday:   DayHours
  wednesday: DayHours
  thursday:  DayHours
  friday:    DayHours
  saturday:  DayHours
  sunday:    DayHours
}

export interface DayHours {
  open:  boolean
  start: string   // 'HH:MM'
  end:   string   // 'HH:MM'
}

// ── Booking flow ───────────────────────────────────────────────────────────
export interface BookingStep {
  step: 1 | 2 | 3 | 4
  // 1 = เลือกบริการ
  // 2 = เลือกวันเวลา
  // 3 = กรอกข้อมูลลูกค้า
  // 4 = ยืนยัน / สำเร็จ
}

export interface BookingDraft {
  serviceId:     string | null
  staffId:       string | null
  date:          string | null   // YYYY-MM-DD
  slotId:        string | null
  customerName:  string
  customerPhone: string
  customerEmail: string
  customerNote:  string
}

// ── UI helpers ─────────────────────────────────────────────────────────────
export type BookingStatus = Database['public']['Enums']['booking_status']
export type TenantPlan    = Database['public']['Enums']['tenant_plan']

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending:   'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิก',
  completed: 'เสร็จสิ้น',
  no_show:   'ไม่มา',
}

export const BOOKING_STATUS_COLOR: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-teal-light text-teal-dark',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-500',
  no_show:   'bg-orange-100 text-orange-600',
}

export const TENANT_PLAN_LABEL: Record<TenantPlan, string> = {
  trial:     'ทดลองฟรี',
  active:    'ใช้งานอยู่',
  suspended: 'ระงับชั่วคราว',
  cancelled: 'ยกเลิกแล้ว',
}

// ── API response types ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ── Signup form ────────────────────────────────────────────────────────────
export interface SignupForm {
  templateId:  string
  shopName:    string
  slug:        string      // subdomain
  ownerEmail:  string
  ownerPhone:  string
}

// ── Super admin stats ──────────────────────────────────────────────────────
export interface AdminStats {
  totalTenants:  number
  activeTenants: number
  trialTenants:  number
  mrr:           number    // monthly recurring revenue (THB)
  totalBookings: number
}
