-- ============================================================
-- 001_SCHEMA.SQL — Tables, enums, constraints
-- Krabbie.com · Multi-tenant SaaS
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for text search on shop names

-- ── ENUMS ────────────────────────────────────────────────────

CREATE TYPE tenant_plan AS ENUM (
  'trial',       -- ทดลองฟรี 30 วัน
  'active',      -- จ่ายเงินแล้ว
  'suspended',   -- ระงับชั่วคราว (ค้างชำระ)
  'cancelled'    -- ยกเลิกแล้ว
);

CREATE TYPE booking_status AS ENUM (
  'pending',     -- รอยืนยัน
  'confirmed',   -- ยืนยันแล้ว
  'cancelled',   -- ยกเลิก
  'completed',   -- เสร็จสิ้น
  'no_show'      -- ไม่มา
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE template_category AS ENUM (
  'booking',     -- จองบริการ
  'shop',        -- ขายสินค้า
  'food',        -- ร้านอาหาร / QR เมนู
  'portfolio'    -- Portfolio / Landing page
);

-- ── TEMPLATES ────────────────────────────────────────────────
-- ข้อมูล template ที่มีให้เลือก (แก้ไขโดย super admin เท่านั้น)

CREATE TABLE templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,        -- 'booking-service', 'booking-spa'
  name          TEXT NOT NULL,
  name_th       TEXT NOT NULL,
  description_th TEXT NOT NULL DEFAULT '',
  category      template_category NOT NULL DEFAULT 'booking',
  phase         SMALLINT NOT NULL DEFAULT 1, -- เปิดตอน phase ไหน
  is_active     BOOLEAN NOT NULL DEFAULT true,
  preview_url   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TENANTS ──────────────────────────────────────────────────
-- แต่ละ row = 1 ร้านค้า

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,         -- subdomain: sabaidee.krabbie.com
  name          TEXT NOT NULL,
  template_id   TEXT NOT NULL,                -- ref templates.slug
  owner_email   TEXT NOT NULL DEFAULT '',
  owner_phone   TEXT NOT NULL DEFAULT '',
  plan          tenant_plan NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,                  -- วันหมดอายุ subscription
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

-- ── SERVICES ─────────────────────────────────────────────────
-- บริการของแต่ละร้าน (นวด 60 นาที, ตัดผม, ฯลฯ)

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

-- ── STAFF ────────────────────────────────────────────────────
-- พนักงาน / ผู้ให้บริการ (optional ใน Phase 1)

CREATE TABLE staff (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TIME_SLOTS ───────────────────────────────────────────────
-- ช่วงเวลาที่รับจอง (generate โดย admin หรือ function)

CREATE TABLE time_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id    UUID REFERENCES staff(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_booked   BOOLEAN NOT NULL DEFAULT false,
  is_blocked  BOOLEAN NOT NULL DEFAULT false,  -- ปิดโดย admin
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_slot_time  CHECK (end_time > start_time),
  -- ป้องกัน slot ซ้ำในร้านเดียวกัน บริการเดียวกัน วันเดียวกัน
  UNIQUE (tenant_id, service_id, staff_id, date, start_time)
);

-- ── BOOKINGS ─────────────────────────────────────────────────
-- การจองของลูกค้า

CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id        UUID NOT NULL REFERENCES services(id),
  slot_id           UUID NOT NULL REFERENCES time_slots(id),
  staff_id          UUID REFERENCES staff(id) ON DELETE SET NULL,
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_email    TEXT,
  customer_note     TEXT,
  status            booking_status NOT NULL DEFAULT 'pending',
  cancelled_reason  TEXT,
  confirmed_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PAYMENTS ─────────────────────────────────────────────────
-- การชำระเงิน subscription ของ tenant

CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL DEFAULT 150,
  method      TEXT NOT NULL DEFAULT 'promptpay',
  status      payment_status NOT NULL DEFAULT 'pending',
  slip_url    TEXT,                              -- รูปสลิป
  paid_at     TIMESTAMPTZ,
  months      SMALLINT NOT NULL DEFAULT 1,      -- จ่ายกี่เดือน
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
