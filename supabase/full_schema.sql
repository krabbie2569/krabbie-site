-- ============================================================
-- KRABBIE.COM — Full Database Schema (รันครั้งเดียวจบ)
-- วาง SQL นี้ทั้งหมดใน Supabase SQL Editor แล้วกด Run
-- ============================================================


-- ════════════════════════════════════════════════
-- PART 1: EXTENSIONS & ENUMS
-- ════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE tenant_plan AS ENUM ('trial', 'active', 'suspended', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE template_category AS ENUM ('booking', 'shop', 'food', 'portfolio');


-- ════════════════════════════════════════════════
-- PART 2: TABLES
-- ════════════════════════════════════════════════

CREATE TABLE templates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  name_th        TEXT NOT NULL,
  description_th TEXT NOT NULL DEFAULT '',
  category       template_category NOT NULL DEFAULT 'booking',
  phase          SMALLINT NOT NULL DEFAULT 1,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  preview_url    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  template_id   TEXT NOT NULL,
  owner_email   TEXT NOT NULL DEFAULT '',
  owner_phone   TEXT NOT NULL DEFAULT '',
  plan          tenant_plan NOT NULL DEFAULT 'trial',
  plan_type     TEXT NOT NULL DEFAULT 'standard' CHECK (plan_type IN ('standard', 'pro')),
  trial_ends_at TIMESTAMPTZ,
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  settings      JSONB NOT NULL DEFAULT '{
    "primaryColor": "#ff6b00",
    "logoUrl": null,
    "lineId": null,
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
      "saturday":  {"open": true,  "start": "09:00", "end": "18:00"},
      "sunday":    {"open": false, "start": "09:00", "end": "18:00"}
    }
  }'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')
);

CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT  NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  price            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE time_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id    UUID REFERENCES staff(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_booked   BOOLEAN NOT NULL DEFAULT false,
  is_blocked  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_slot_time CHECK (end_time > start_time),
  UNIQUE (tenant_id, service_id, date, start_time)
);

CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id       UUID NOT NULL REFERENCES services(id),
  slot_id          UUID NOT NULL REFERENCES time_slots(id),
  staff_id         UUID REFERENCES staff(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,
  customer_note    TEXT,
  status           booking_status NOT NULL DEFAULT 'pending',
  cancelled_reason TEXT,
  confirmed_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount           NUMERIC(10,2) NOT NULL DEFAULT 150,
  method           TEXT NOT NULL DEFAULT 'promptpay',
  status           payment_status NOT NULL DEFAULT 'pending',
  slip_url         TEXT,
  paid_at          TIMESTAMPTZ,
  months           SMALLINT NOT NULL DEFAULT 1,
  note             TEXT,
  -- slip verification
  transaction_ref  TEXT UNIQUE,
  verified_amount  NUMERIC(10,2),
  verified_at      TIMESTAMPTZ,
  verify_method    TEXT,         -- 'easyslip' | 'claude_vision' | 'manual'
  verify_raw       JSONB,
  -- plan & review
  plan_type        TEXT NOT NULL DEFAULT 'standard',
  review_status    TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'auto_approved', 'admin_approved', 'rejected')),
  reviewed_by      TEXT,
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plans (
  id            TEXT PRIMARY KEY,   -- 'standard' | 'pro'
  name_th       TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  features      JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════
-- PART 3: ROW LEVEL SECURITY
-- ════════════════════════════════════════════════

ALTER TABLE templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff      ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_public_read"  ON templates  FOR SELECT USING (true);
CREATE POLICY "templates_service_all"  ON templates  FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "tenants_public_read"    ON tenants    FOR SELECT USING (true);
CREATE POLICY "tenants_service_all"    ON tenants    FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "services_public_read"   ON services   FOR SELECT USING (is_active = true);
CREATE POLICY "services_service_all"   ON services   FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "staff_public_read"      ON staff      FOR SELECT USING (is_active = true);
CREATE POLICY "staff_service_all"      ON staff      FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "time_slots_public_read" ON time_slots FOR SELECT USING (is_blocked = false);
CREATE POLICY "time_slots_service_all" ON time_slots FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "bookings_anon_insert"   ON bookings   FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_service_all"   ON bookings   FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "payments_service_all"   ON payments   FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "plans_public_read"      ON plans      FOR SELECT USING (true);
CREATE POLICY "plans_service_all"      ON plans      FOR ALL    USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════
-- PART 4: INDEXES
-- ════════════════════════════════════════════════

CREATE INDEX idx_tenants_slug              ON tenants     (slug);
CREATE INDEX idx_tenants_plan              ON tenants     (plan);
CREATE INDEX idx_tenants_expires           ON tenants     (expires_at) WHERE plan = 'active';
CREATE INDEX idx_services_tenant           ON services    (tenant_id, is_active, sort_order);
CREATE INDEX idx_staff_tenant              ON staff       (tenant_id, is_active);
CREATE INDEX idx_slots_tenant_service_date ON time_slots  (tenant_id, service_id, date, start_time) WHERE is_blocked = false;
CREATE INDEX idx_slots_available           ON time_slots  (tenant_id, date, is_booked) WHERE is_booked = false AND is_blocked = false;
CREATE INDEX idx_bookings_tenant_created   ON bookings    (tenant_id, created_at DESC);
CREATE INDEX idx_bookings_tenant_status    ON bookings    (tenant_id, status);
CREATE INDEX idx_bookings_slot             ON bookings    (slot_id);
CREATE INDEX idx_bookings_phone            ON bookings    (customer_phone, tenant_id);
CREATE INDEX idx_payments_tenant           ON payments    (tenant_id, created_at DESC);
CREATE UNIQUE INDEX idx_payments_transaction_ref ON payments (transaction_ref) WHERE transaction_ref IS NOT NULL;
CREATE INDEX idx_payments_review_pending   ON payments    (review_status, created_at DESC) WHERE review_status = 'pending';
CREATE INDEX idx_tenants_name_trgm         ON tenants     USING gin (name gin_trgm_ops);


-- ════════════════════════════════════════════════
-- PART 5: FUNCTIONS & TRIGGERS
-- ════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at  BEFORE UPDATE ON tenants  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION set_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN NEW.confirmed_at = NOW(); END IF;
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN NEW.completed_at = NOW(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_timestamps
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_timestamps();

CREATE OR REPLACE FUNCTION mark_slot_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM time_slots WHERE id = NEW.slot_id AND is_booked = true) THEN
    RAISE EXCEPTION 'slot_already_booked' USING HINT = 'ช่วงเวลานี้ถูกจองแล้ว';
  END IF;
  UPDATE time_slots SET is_booked = true WHERE id = NEW.slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mark_slot_on_booking
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION mark_slot_on_booking();

CREATE OR REPLACE FUNCTION unmark_slot_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'no_show') AND OLD.status NOT IN ('cancelled', 'no_show') THEN
    UPDATE time_slots SET is_booked = false WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unmark_slot_on_cancel
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION unmark_slot_on_cancel();

CREATE OR REPLACE FUNCTION generate_day_slots(
  p_tenant_id  UUID, p_service_id UUID, p_date DATE,
  p_start_time TIME, p_end_time   TIME, p_staff_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_duration INT; v_current TIME; v_slot_end TIME; v_count INT := 0;
BEGIN
  SELECT duration_minutes INTO v_duration FROM services WHERE id = p_service_id AND tenant_id = p_tenant_id;
  IF v_duration IS NULL THEN RAISE EXCEPTION 'service_not_found'; END IF;
  v_current := p_start_time;
  WHILE v_current + (v_duration || ' minutes')::INTERVAL <= p_end_time LOOP
    v_slot_end := v_current + (v_duration || ' minutes')::INTERVAL;
    INSERT INTO time_slots (tenant_id, service_id, staff_id, date, start_time, end_time)
    VALUES (p_tenant_id, p_service_id, p_staff_id, p_date, v_current, v_slot_end)
    ON CONFLICT DO NOTHING;
    v_count   := v_count + 1;
    v_current := v_slot_end;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_upcoming_slots(
  p_tenant_id UUID, p_service_id UUID,
  p_days_ahead INT DEFAULT 30, p_staff_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_settings JSONB; v_date DATE := CURRENT_DATE;
  v_end_date DATE  := CURRENT_DATE + p_days_ahead;
  v_day_name TEXT;  v_day_hours JSONB;
  v_total    INT   := 0; v_cnt INT;
BEGIN
  SELECT settings INTO v_settings FROM tenants WHERE id = p_tenant_id;
  IF v_settings IS NULL THEN RAISE EXCEPTION 'tenant_not_found'; END IF;
  WHILE v_date <= v_end_date LOOP
    v_day_name  := lower(trim(to_char(v_date, 'Day')));
    v_day_hours := v_settings -> 'businessHours' -> v_day_name;
    IF v_day_hours IS NOT NULL AND (v_day_hours ->> 'open')::BOOLEAN THEN
      SELECT generate_day_slots(
        p_tenant_id, p_service_id, v_date,
        (v_day_hours ->> 'start')::TIME, (v_day_hours ->> 'end')::TIME, p_staff_id
      ) INTO v_cnt;
      v_total := v_total + v_cnt;
    END IF;
    v_date := v_date + 1;
  END LOOP;
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_tenant_stats(p_tenant_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_bookings',     COUNT(*),
      'pending',            COUNT(*) FILTER (WHERE status = 'pending'),
      'confirmed',          COUNT(*) FILTER (WHERE status = 'confirmed'),
      'completed',          COUNT(*) FILTER (WHERE status = 'completed'),
      'cancelled',          COUNT(*) FILTER (WHERE status = 'cancelled'),
      'today_bookings',     COUNT(*) FILTER (
                              WHERE EXISTS (SELECT 1 FROM time_slots ts WHERE ts.id = bookings.slot_id AND ts.date = CURRENT_DATE)
                            ),
      'this_month_revenue', COALESCE(SUM(s.price) FILTER (WHERE status = 'completed'), 0)
    )
    FROM bookings LEFT JOIN services s ON s.id = bookings.service_id
    WHERE bookings.tenant_id = p_tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_tenants',        COUNT(*),
      'active_tenants',       COUNT(*) FILTER (WHERE plan = 'active'),
      'trial_tenants',        COUNT(*) FILTER (WHERE plan = 'trial'),
      'suspended',            COUNT(*) FILTER (WHERE plan = 'suspended'),
      'mrr',                  COUNT(*) FILTER (WHERE plan = 'active') * 150,
      'trials_expiring_soon', COUNT(*) FILTER (
                                WHERE plan = 'trial'
                                AND trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
                              )
    ) FROM tenants
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION activate_tenant(p_tenant_id UUID, p_payment_id UUID, p_months INT DEFAULT 1)
RETURNS VOID AS $$
DECLARE v_expires TIMESTAMPTZ; v_new TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO v_expires FROM tenants WHERE id = p_tenant_id;
  v_new := CASE WHEN v_expires IS NULL OR v_expires < NOW() THEN NOW() ELSE v_expires END
           + (p_months || ' months')::INTERVAL;
  UPDATE tenants  SET plan = 'active', activated_at = COALESCE(activated_at, NOW()), expires_at = v_new WHERE id = p_tenant_id;
  UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = p_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION suspend_expired_tenants()
RETURNS INT AS $$
DECLARE v_count INT := 0;
BEGIN
  UPDATE tenants SET plan = 'suspended' WHERE plan = 'active' AND expires_at    < NOW();
  UPDATE tenants SET plan = 'suspended' WHERE plan = 'trial'  AND trial_ends_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_slots()
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM time_slots WHERE date < CURRENT_DATE - INTERVAL '90 days' AND is_booked = false;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ════════════════════════════════════════════════
-- PART 6: STORAGE BUCKET (payment-slips)
-- ════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-slips', 'payment-slips', false,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "slip_upload_anon"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payment-slips');

CREATE POLICY "slip_read_service"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'payment-slips');

CREATE POLICY "slip_delete_service"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'payment-slips');


-- ════════════════════════════════════════════════
-- PART 7: SEED DATA
-- ════════════════════════════════════════════════

INSERT INTO plans (id, name_th, price_monthly, features) VALUES
('standard', 'Standard', 150.00, '[
  "1 Template",
  "ระบบจองออนไลน์ 24/7",
  "Admin Dashboard",
  "Web Push แจ้งเตือน",
  "Subdomain .krabbie.com",
  "Backup ทุกคืน",
  "Support ผ่าน Line"
]'::JSONB),
('pro', 'Pro', 390.00, '[
  "ทุกอย่างใน Standard",
  "Custom Domain (ชื่อ.com ของตัวเอง)",
  "ลบ Krabbie branding",
  "Analytics dashboard",
  "Priority support",
  "Export ข้อมูลลูกค้า CSV",
  "API access"
]'::JSONB)
ON CONFLICT (id) DO NOTHING;

INSERT INTO templates (slug, name, name_th, description_th, category, phase, is_active) VALUES
('booking-service', 'Service Booking', 'ระบบจองบริการ',        'นวด · ฝึกสอน · ช่างภาพ · ซ่อม',       'booking',   1, true),
('booking-spa',     'Spa & Massage',   'สปา & นวดแผนไทย',      'สปา · อโรมา · ออนเซ็น',                'booking',   1, true),
('shop-general',    'Online Shop',     'ร้านขายสินค้าออนไลน์', 'เสื้อผ้า · handmade · สินค้าทั่วไป',   'shop',      3, false),
('food-qr-menu',    'QR Menu',         'QR เมนูดิจิทัล',       'ร้านอาหาร · คาเฟ่ · ร้านเครื่องดื่ม', 'food',      3, false),
('portfolio-basic', 'Portfolio',       'Portfolio & Landing',   'ช่างภาพ · นักออกแบบ · Freelance',      'portfolio', 3, false);

-- Demo tenant (DEV ONLY — ลบก่อน production จริง)
INSERT INTO tenants (slug, name, template_id, owner_email, owner_phone, plan, trial_ends_at)
VALUES ('sabaidee', 'ร้านนวดสบาย', 'booking-service', 'demo@krabbie.com', '0812345678', 'trial', NOW() + INTERVAL '30 days');

WITH t AS (SELECT id FROM tenants WHERE slug = 'sabaidee')
INSERT INTO services (tenant_id, name, description, duration_minutes, price, sort_order)
SELECT t.id, v.name, v.desc, v.dur, v.price, v.ord FROM t,
(VALUES
  ('นวดแผนไทย 60 นาที',  'ผ่อนคลายกล้ามเนื้อ',          60,  300, 1),
  ('นวดแผนไทย 120 นาที', 'ผ่อนคลายเต็มตัว',             120, 500, 2),
  ('อโรมาเธอราพี',       'นวดน้ำมันหอมระเหยบำรุงผิว',   90,  450, 3),
  ('นวดเท้า',            'กดจุดฝ่าเท้าเพื่อสุขภาพ',     45,  250, 4)
) AS v(name, desc, dur, price, ord);

DO $$
DECLARE v_tid UUID; v_sid UUID;
BEGIN
  SELECT id INTO v_tid FROM tenants  WHERE slug = 'sabaidee';
  SELECT id INTO v_sid FROM services WHERE tenant_id = v_tid AND duration_minutes = 60 LIMIT 1;
  PERFORM generate_upcoming_slots(v_tid, v_sid, 7);
END $$;


-- ════════════════════════════════════════════════
-- DONE ✓
-- ════════════════════════════════════════════════
