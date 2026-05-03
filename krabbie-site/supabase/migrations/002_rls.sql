-- ============================================================
-- 002_RLS.SQL — Row Level Security
-- Strategy:
--   • Public (anon):       อ่านข้อมูลร้านได้ (services, slots, tenant name)
--                          insert bookings ได้ (ลูกค้าจอง)
--   • Service role:        ทำได้ทุกอย่าง (server-side API routes)
--   • Authenticated user:  ยังไม่ใช้ Phase 1 (เพิ่ม Phase 2)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff       ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;

-- ── TEMPLATES ────────────────────────────────────────────────
-- ทุกคนอ่านได้ (แสดงในหน้าเลือก template)
CREATE POLICY "templates_public_read"
  ON templates FOR SELECT
  USING (true);

-- เพิ่ม/แก้ไข: service role เท่านั้น (super admin)
CREATE POLICY "templates_service_all"
  ON templates FOR ALL
  USING (auth.role() = 'service_role');

-- ── TENANTS ──────────────────────────────────────────────────
-- อ่านข้อมูลร้านได้ทุกคน (ลูกค้าต้องเห็นชื่อร้าน, settings)
CREATE POLICY "tenants_public_read"
  ON tenants FOR SELECT
  USING (true);

-- สร้าง / แก้ไข / ลบ: service role เท่านั้น
CREATE POLICY "tenants_service_all"
  ON tenants FOR ALL
  USING (auth.role() = 'service_role');

-- ── SERVICES ─────────────────────────────────────────────────
-- ลูกค้าอ่านได้เฉพาะ service ที่ is_active = true
CREATE POLICY "services_public_read"
  ON services FOR SELECT
  USING (is_active = true);

-- Service role ทำได้ทุกอย่าง
CREATE POLICY "services_service_all"
  ON services FOR ALL
  USING (auth.role() = 'service_role');

-- ── STAFF ────────────────────────────────────────────────────
-- ลูกค้าอ่าน staff ที่ active ได้
CREATE POLICY "staff_public_read"
  ON staff FOR SELECT
  USING (is_active = true);

CREATE POLICY "staff_service_all"
  ON staff FOR ALL
  USING (auth.role() = 'service_role');

-- ── TIME_SLOTS ───────────────────────────────────────────────
-- ลูกค้าอ่าน slot ที่ยังไม่ถูก block ได้
-- (is_booked อ่านได้ด้วย เพื่อแสดงว่า "เต็ม")
CREATE POLICY "time_slots_public_read"
  ON time_slots FOR SELECT
  USING (is_blocked = false);

-- Service role ทำได้ทุกอย่าง (generate slots, block slots)
CREATE POLICY "time_slots_service_all"
  ON time_slots FOR ALL
  USING (auth.role() = 'service_role');

-- Anon สามารถ update is_booked ได้ (ตอนลูกค้าจอง)
-- Note: จริงๆ ควรทำผ่าน server-side API เพื่อป้องกัน race condition
-- แต่สำหรับ Phase 1 อนุญาตไว้ก่อน
CREATE POLICY "time_slots_anon_book"
  ON time_slots FOR UPDATE
  USING (is_booked = false AND is_blocked = false)
  WITH CHECK (is_booked = true);

-- ── BOOKINGS ─────────────────────────────────────────────────
-- ลูกค้า (anon) สามารถ insert booking ได้
CREATE POLICY "bookings_anon_insert"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- ลูกค้าอ่าน booking ของตัวเองไม่ได้ผ่าน anon (ใช้ phone lookup แทน)
-- Service role อ่าน/แก้ไขได้ทั้งหมด
CREATE POLICY "bookings_service_all"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');

-- ── PAYMENTS ─────────────────────────────────────────────────
-- Service role เท่านั้น (ข้อมูลการเงิน)
CREATE POLICY "payments_service_all"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');
