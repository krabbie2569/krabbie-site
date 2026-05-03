-- ============================================================
-- 005_SEED.SQL — Initial data
-- ============================================================

-- ── TEMPLATES ────────────────────────────────────────────────

INSERT INTO templates (slug, name, name_th, description_th, category, phase, is_active) VALUES

('booking-service',
 'Service Booking',
 'ระบบจองบริการ',
 'เหมาะสำหรับร้านนวด · ฝึกสอน · ช่างภาพ · ซ่อมแซม · บริการรายชั่วโมง',
 'booking', 1, true),

('booking-spa',
 'Spa & Massage',
 'สปา & นวดแผนไทย',
 'Template เฉพาะทางสำหรับร้านสปา · นวดแผนไทย · อโรมา · ออนเซ็น',
 'booking', 1, true),

('shop-general',
 'Online Shop',
 'ร้านขายสินค้าออนไลน์',
 'เสื้อผ้า · งาน handmade · ของขวัญ · สินค้าทั่วไป พร้อมตะกร้าสินค้า',
 'shop', 3, false),

('food-qr-menu',
 'QR Menu',
 'QR เมนูดิจิทัล',
 'ร้านอาหาร · คาเฟ่ · ร้านเครื่องดื่ม ลูกค้าสแกน QR ดูเมนูได้ทันที',
 'food', 3, false),

('portfolio-basic',
 'Portfolio',
 'Portfolio & Landing Page',
 'ช่างภาพ · นักออกแบบ · Freelance · เจ้าของธุรกิจที่ต้องการหน้าแนะนำตัว',
 'portfolio', 3, false);


-- ── DEMO TENANT (สำหรับ development เท่านั้น) ───────────────
-- ใส่ comment ออกเมื่อ deploy production

INSERT INTO tenants (
  slug, name, template_id, owner_email, owner_phone, plan, trial_ends_at,
  settings
) VALUES (
  'sabaidee',
  'ร้านนวดสบาย',
  'booking-service',
  'demo@krabbie.com',
  '0812345678',
  'trial',
  NOW() + INTERVAL '30 days',
  '{
    "primaryColor": "#ff6b00",
    "logoUrl": null,
    "lineId": "@sabaidee",
    "lineNotify": false,
    "pushEnabled": false,
    "maxAdvanceDays": 30,
    "autoConfirm": true,
    "businessHours": {
      "monday":    {"open": true,  "start": "09:00", "end": "18:00"},
      "tuesday":   {"open": true,  "start": "09:00", "end": "18:00"},
      "wednesday": {"open": true,  "start": "09:00", "end": "18:00"},
      "thursday":  {"open": true,  "start": "09:00", "end": "18:00"},
      "friday":    {"open": true,  "start": "09:00", "end": "18:00"},
      "saturday":  {"open": true,  "start": "09:00", "end": "20:00"},
      "sunday":    {"open": false, "start": "09:00", "end": "18:00"}
    }
  }'::JSONB
);

-- Demo services สำหรับ tenant "sabaidee"
WITH t AS (SELECT id FROM tenants WHERE slug = 'sabaidee')
INSERT INTO services (tenant_id, name, description, duration_minutes, price, sort_order)
SELECT
  t.id, name, description, duration_minutes, price, sort_order
FROM t, (VALUES
  ('นวดแผนไทย',    'ผ่อนคลายกล้ามเนื้อด้วยการนวดแบบดั้งเดิม',  60,  300, 1),
  ('นวดแผนไทย',    'ผ่อนคลายกล้ามเนื้อด้วยการนวดแบบดั้งเดิม', 120,  500, 2),
  ('อโรมาเธอราพี', 'นวดน้ำมันหอมระเหยบำรุงผิว',                90,  450, 3),
  ('นวดเท้า',      'กดจุดฝ่าเท้าเพื่อสุขภาพ',                  45,  250, 4)
) AS v(name, description, duration_minutes, price, sort_order);

-- Demo staff
WITH t AS (SELECT id FROM tenants WHERE slug = 'sabaidee')
INSERT INTO staff (tenant_id, name)
SELECT t.id, name FROM t, (VALUES ('น้องมิ้ว'), ('น้องฝน')) AS v(name);

-- Demo time slots (วันนี้ + 3 วัน)
DO $$
DECLARE
  v_tenant_id   UUID;
  v_service_id  UUID;
  v_date        DATE;
  v_slots_count INT;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'sabaidee';
  SELECT id INTO v_service_id FROM services
  WHERE tenant_id = v_tenant_id AND name = 'นวดแผนไทย' AND duration_minutes = 60
  LIMIT 1;

  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE + i;
    -- Skip Sunday (day 0)
    IF EXTRACT(DOW FROM v_date) != 0 THEN
      SELECT generate_day_slots(
        v_tenant_id, v_service_id, v_date,
        '09:00'::TIME, '18:00'::TIME
      ) INTO v_slots_count;
    END IF;
  END LOOP;
END $$;
