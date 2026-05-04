// Demo data seeded automatically when a new shop is created.
// Owner can edit or delete everything — it's just a starting point.

type SupabaseClient = any

interface ServiceSeed {
  name: string
  description: string
  duration_minutes: number
  price: number
  sort_order: number
}

interface TemplateSeed {
  staffName: string
  services: ServiceSeed[]
}

const SEEDS: Record<string, TemplateSeed> = {
  'booking-service': {
    staffName: 'พนักงานประจำร้าน',
    services: [
      { name: 'นวดแผนไทย',            description: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย',   duration_minutes: 60,  price: 350, sort_order: 1 },
      { name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย สีไม่ลอก ทนนาน 3–4 สัปดาห์',                 duration_minutes: 90,  price: 550, sort_order: 2 },
      { name: 'สปาตัวทั้งตัว',          description: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',            duration_minutes: 120, price: 890, sort_order: 3 },
    ],
  },
  'booking-rental': {
    staffName: 'ผู้ดูแลการเช่า',
    services: [
      { name: 'เช่ากล้อง DSLR',       description: 'กล้อง + เลนส์ 18-55mm + แบตสำรอง + กระเป๋า',          duration_minutes: 480, price: 800,  sort_order: 1 },
      { name: 'เช่าชุดแฟนซี',          description: 'ชุดคอสเพลย์ / แต่งกาย ให้เลือกหลายแบบ',                duration_minutes: 240, price: 350,  sort_order: 2 },
      { name: 'เช่าอุปกรณ์แคมปิ้ง',   description: 'เต็นท์ + ถุงนอน + เตาแก๊ส ครบชุด 1 คืน',              duration_minutes: 1440, price: 1200, sort_order: 3 },
    ],
  },
  'shop': {
    staffName: 'พนักงานขาย',
    services: [
      { name: 'สินค้าตัวอย่าง A', description: 'แก้ไขชื่อและราคาได้ที่ Admin → บริการ', duration_minutes: 1, price: 299, sort_order: 1 },
      { name: 'สินค้าตัวอย่าง B', description: 'แก้ไขชื่อและราคาได้ที่ Admin → บริการ', duration_minutes: 1, price: 599, sort_order: 2 },
      { name: 'สินค้าตัวอย่าง C', description: 'แก้ไขชื่อและราคาได้ที่ Admin → บริการ', duration_minutes: 1, price: 999, sort_order: 3 },
    ],
  },
  'qr-menu': {
    staffName: 'พนักงานเสิร์ฟ',
    services: [
      { name: 'ข้าวผัดกระเพรา',  description: 'ข้าวผัดกระเพราหมูสับ ไข่ดาว สูตรเด็ด', duration_minutes: 1, price: 60,  sort_order: 1 },
      { name: 'ต้มยำกุ้ง',        description: 'ต้มยำกุ้งน้ำข้น สูตรโบราณ',             duration_minutes: 1, price: 120, sort_order: 2 },
      { name: 'ชาเย็น / กาแฟเย็น', description: 'เครื่องดื่มเย็น ราคาระบุต่อแก้ว',       duration_minutes: 1, price: 45,  sort_order: 3 },
    ],
  },
}

// Fixed daily slot start-times (HH:MM). End-time = start + duration.
const SLOT_STARTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function nextNDates(n: number): string[] {
  const dates: string[] = []
  const d = new Date()
  for (let i = 1; i <= n; i++) {
    const next = new Date(d)
    next.setDate(d.getDate() + i)
    if (next.getDay() === 0) continue // skip Sunday (shop default closed)
    dates.push(next.toISOString().slice(0, 10))
  }
  return dates
}

export async function seedDemoData(
  tenantId: string,
  templateId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const seed = SEEDS[templateId] ?? SEEDS['booking-service']

  // 1. Insert staff
  const { data: staffRow } = await supabase
    .from('staff')
    .insert({ tenant_id: tenantId, name: seed.staffName, is_active: true })
    .select('id')
    .single()

  const staffId: string | null = staffRow?.id ?? null

  // 2. Insert services
  const { data: insertedServices } = await supabase
    .from('services')
    .insert(seed.services.map(s => ({ ...s, tenant_id: tenantId, is_active: true })))
    .select('id, duration_minutes')

  if (!insertedServices?.length) return

  // 3. Generate time slots (14 weekdays ahead) for booking-type templates only
  const isBooking = templateId === 'booking-service' || templateId === 'booking-rental'
  if (!isBooking) return

  const dates = nextNDates(20) // enough to get 14 weekdays
  const END_OF_DAY = '18:00'
  const slots: Array<{
    tenant_id: string; service_id: string; staff_id: string | null
    date: string; start_time: string; end_time: string
    is_booked: boolean; is_blocked: boolean
  }> = []

  for (const svc of insertedServices as { id: string; duration_minutes: number }[]) {
    for (const date of dates.slice(0, 14)) {
      for (const start of SLOT_STARTS) {
        const end = addMinutes(start, svc.duration_minutes)
        if (end > END_OF_DAY) continue
        slots.push({
          tenant_id: tenantId, service_id: svc.id, staff_id: staffId,
          date, start_time: start, end_time: end,
          is_booked: false, is_blocked: false,
        })
      }
    }
  }

  // Insert in chunks of 100 to stay well under Supabase limits
  for (let i = 0; i < slots.length; i += 100) {
    await supabase.from('time_slots').insert(slots.slice(i, i + 100))
  }
}
