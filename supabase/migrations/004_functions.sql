-- ============================================================
-- 004_FUNCTIONS.SQL — Triggers & helper functions
-- ============================================================

-- ── TRIGGER: updated_at auto-update ──────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── TRIGGER: booking confirmed/completed timestamps ──────────

CREATE OR REPLACE FUNCTION set_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = NOW();
  END IF;
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_timestamps
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_timestamps();


-- ── TRIGGER: mark slot booked when booking inserted ──────────
-- ป้องกัน race condition — slot ถูก mark ทันทีที่มี booking insert

CREATE OR REPLACE FUNCTION mark_slot_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- ตรวจสอบว่า slot ยังว่างอยู่
  IF EXISTS (
    SELECT 1 FROM time_slots
    WHERE id = NEW.slot_id AND is_booked = true
  ) THEN
    RAISE EXCEPTION 'slot_already_booked' USING HINT = 'ช่วงเวลานี้ถูกจองแล้ว';
  END IF;

  -- Mark slot as booked
  UPDATE time_slots SET is_booked = true WHERE id = NEW.slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mark_slot_on_booking
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION mark_slot_on_booking();


-- ── TRIGGER: unmark slot when booking cancelled ───────────────

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


-- ── FUNCTION: generate_day_slots ─────────────────────────────
-- สร้าง time slots สำหรับ 1 วัน
-- ใช้จาก admin panel เมื่อ setup ตารางเวลา

CREATE OR REPLACE FUNCTION generate_day_slots(
  p_tenant_id   UUID,
  p_service_id  UUID,
  p_date        DATE,
  p_start_time  TIME,
  p_end_time    TIME,
  p_staff_id    UUID DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_duration    INT;
  v_current     TIME;
  v_slot_end    TIME;
  v_count       INT := 0;
BEGIN
  -- Get service duration
  SELECT duration_minutes INTO v_duration
  FROM services
  WHERE id = p_service_id AND tenant_id = p_tenant_id;

  IF v_duration IS NULL THEN
    RAISE EXCEPTION 'service_not_found';
  END IF;

  v_current := p_start_time;

  WHILE v_current + (v_duration || ' minutes')::INTERVAL <= p_end_time LOOP
    v_slot_end := v_current + (v_duration || ' minutes')::INTERVAL;

    INSERT INTO time_slots (tenant_id, service_id, staff_id, date, start_time, end_time)
    VALUES (p_tenant_id, p_service_id, p_staff_id, p_date, v_current, v_slot_end)
    ON CONFLICT (tenant_id, service_id, staff_id, date, start_time) DO NOTHING;

    -- Handle NULL staff_id uniqueness separately
    IF p_staff_id IS NULL THEN
      INSERT INTO time_slots (tenant_id, service_id, date, start_time, end_time)
      VALUES (p_tenant_id, p_service_id, p_date, v_current, v_slot_end)
      ON CONFLICT DO NOTHING;
    END IF;

    v_count   := v_count + 1;
    v_current := v_slot_end;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: generate_week_slots ────────────────────────────
-- สร้าง slots ล่วงหน้า N วัน ตาม business hours ของร้าน

CREATE OR REPLACE FUNCTION generate_upcoming_slots(
  p_tenant_id   UUID,
  p_service_id  UUID,
  p_days_ahead  INT DEFAULT 30,
  p_staff_id    UUID DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_settings    JSONB;
  v_current_date DATE := CURRENT_DATE;
  v_end_date    DATE := CURRENT_DATE + p_days_ahead;
  v_day_name    TEXT;
  v_day_hours   JSONB;
  v_start_time  TIME;
  v_end_time    TIME;
  v_total       INT := 0;
  v_day_count   INT;
BEGIN
  SELECT settings INTO v_settings
  FROM tenants WHERE id = p_tenant_id;

  IF v_settings IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found';
  END IF;

  WHILE v_current_date <= v_end_date LOOP
    -- Get day name in lowercase English
    v_day_name := lower(to_char(v_current_date, 'Day'));
    v_day_name := trim(v_day_name);  -- to_char pads with spaces

    -- Map day to settings key
    v_day_hours := v_settings -> 'businessHours' -> v_day_name;

    -- Skip if closed
    IF v_day_hours IS NOT NULL AND (v_day_hours ->> 'open')::BOOLEAN THEN
      v_start_time := (v_day_hours ->> 'start')::TIME;
      v_end_time   := (v_day_hours ->> 'end')::TIME;

      SELECT generate_day_slots(
        p_tenant_id, p_service_id, v_current_date,
        v_start_time, v_end_time, p_staff_id
      ) INTO v_day_count;

      v_total := v_total + v_day_count;
    END IF;

    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: get_tenant_stats ────────────────────────────────
-- ดึงสถิติรวมของร้าน (ใช้ใน tenant admin dashboard)

CREATE OR REPLACE FUNCTION get_tenant_stats(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_bookings',     COUNT(*),
    'pending',            COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed',          COUNT(*) FILTER (WHERE status = 'confirmed'),
    'completed',          COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled',          COUNT(*) FILTER (WHERE status = 'cancelled'),
    'today_bookings',     COUNT(*) FILTER (
                            WHERE EXISTS (
                              SELECT 1 FROM time_slots ts
                              WHERE ts.id = bookings.slot_id
                              AND ts.date = CURRENT_DATE
                            )
                          ),
    'this_month_revenue', COALESCE(SUM(s.price) FILTER (WHERE status = 'completed'), 0)
  ) INTO v_result
  FROM bookings
  LEFT JOIN services s ON s.id = bookings.service_id
  WHERE bookings.tenant_id = p_tenant_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: get_admin_stats ─────────────────────────────────
-- สถิติ super admin (MRR, tenant counts)

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_tenants',   COUNT(*),
      'active_tenants',  COUNT(*) FILTER (WHERE plan = 'active'),
      'trial_tenants',   COUNT(*) FILTER (WHERE plan = 'trial'),
      'suspended',       COUNT(*) FILTER (WHERE plan = 'suspended'),
      'mrr',             COUNT(*) FILTER (WHERE plan = 'active') * 150,
      'trials_expiring_soon', COUNT(*) FILTER (
                                WHERE plan = 'trial'
                                AND trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
                              )
    )
    FROM tenants
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: activate_tenant ────────────────────────────────
-- เรียกหลังยืนยันการชำระเงิน

CREATE OR REPLACE FUNCTION activate_tenant(
  p_tenant_id  UUID,
  p_payment_id UUID,
  p_months     INT DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_current_expires TIMESTAMPTZ;
  v_new_expires     TIMESTAMPTZ;
BEGIN
  -- คำนวณ expires_at (ต่อจากวันที่มีอยู่ถ้ายังไม่หมด)
  SELECT expires_at INTO v_current_expires FROM tenants WHERE id = p_tenant_id;

  IF v_current_expires IS NULL OR v_current_expires < NOW() THEN
    v_new_expires := NOW() + (p_months || ' months')::INTERVAL;
  ELSE
    v_new_expires := v_current_expires + (p_months || ' months')::INTERVAL;
  END IF;

  -- Update tenant
  UPDATE tenants SET
    plan         = 'active',
    activated_at = COALESCE(activated_at, NOW()),
    expires_at   = v_new_expires
  WHERE id = p_tenant_id;

  -- Mark payment as paid
  UPDATE payments SET
    status  = 'paid',
    paid_at = NOW()
  WHERE id = p_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: cleanup_expired_tenants ────────────────────────
-- เรียกโดย cron job ทุกคืน (Supabase pg_cron)

CREATE OR REPLACE FUNCTION suspend_expired_tenants()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE tenants SET plan = 'suspended'
  WHERE plan = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- ยัง trial แต่หมดเวลาแล้ว
  UPDATE tenants SET plan = 'suspended'
  WHERE plan = 'trial'
    AND trial_ends_at < NOW();

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── FUNCTION: cleanup_old_slots ──────────────────────────────
-- ลบ slots ที่ผ่านมาแล้ว > 90 วัน (ประหยัด storage)

CREATE OR REPLACE FUNCTION cleanup_old_slots()
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM time_slots
  WHERE date < CURRENT_DATE - INTERVAL '90 days'
    AND is_booked = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
