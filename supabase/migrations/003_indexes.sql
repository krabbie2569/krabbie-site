-- ============================================================
-- 003_INDEXES.SQL — Performance indexes
-- Rule: tenant_id เป็น column แรกเสมอ (partition pruning)
-- ============================================================

-- ── TENANTS ──────────────────────────────────────────────────
-- slug lookup ทุก request (middleware resolve tenant)
CREATE INDEX idx_tenants_slug      ON tenants (slug);
CREATE INDEX idx_tenants_plan      ON tenants (plan);
CREATE INDEX idx_tenants_expires   ON tenants (expires_at) WHERE plan = 'active';

-- ── SERVICES ─────────────────────────────────────────────────
-- query บ่อยที่สุด: หา services ของร้าน + is_active
CREATE INDEX idx_services_tenant           ON services (tenant_id, is_active, sort_order);
CREATE INDEX idx_services_tenant_id        ON services (tenant_id, id);

-- ── STAFF ────────────────────────────────────────────────────
CREATE INDEX idx_staff_tenant ON staff (tenant_id, is_active);

-- ── TIME_SLOTS ───────────────────────────────────────────────
-- query หลัก: หา slot ของร้าน + บริการ + วันที่
CREATE INDEX idx_slots_tenant_service_date
  ON time_slots (tenant_id, service_id, date, start_time)
  WHERE is_blocked = false;

-- query ตรวจสอบ slot ว่าง
CREATE INDEX idx_slots_available
  ON time_slots (tenant_id, date, is_booked)
  WHERE is_booked = false AND is_blocked = false;

-- staff schedule lookup
CREATE INDEX idx_slots_staff_date
  ON time_slots (staff_id, date)
  WHERE staff_id IS NOT NULL;

-- ── BOOKINGS ─────────────────────────────────────────────────
-- admin ดู bookings ของร้านตัวเอง
CREATE INDEX idx_bookings_tenant_created
  ON bookings (tenant_id, created_at DESC);

-- filter by status (pending รอยืนยัน)
CREATE INDEX idx_bookings_tenant_status
  ON bookings (tenant_id, status);

-- link to slot
CREATE INDEX idx_bookings_slot  ON bookings (slot_id);

-- ค้นหาการจองด้วยเบอร์โทร (ลูกค้าเช็คการจอง)
CREATE INDEX idx_bookings_phone ON bookings (customer_phone, tenant_id);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE INDEX idx_payments_tenant         ON payments (tenant_id, created_at DESC);
CREATE INDEX idx_payments_status         ON payments (status) WHERE status = 'pending';

-- ── FULL TEXT SEARCH (optional แต่มีประโยชน์) ──────────────
CREATE INDEX idx_tenants_name_trgm  ON tenants  USING gin (name gin_trgm_ops);
CREATE INDEX idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
