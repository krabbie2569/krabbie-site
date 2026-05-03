-- ============================================================
-- 007_PLANS.SQL — Standard vs Pro plan
-- ============================================================

-- plan_type แยก Standard / Pro
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (plan_type IN ('standard', 'pro'));

-- payments: เพิ่ม plan_type + review fields
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plan_type        TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS review_status    TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'auto_approved', 'admin_approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by      TEXT,          -- admin email
  ADD COLUMN IF NOT EXISTS reviewed_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- index สำหรับ admin queue
CREATE INDEX IF NOT EXISTS idx_payments_review_pending
  ON payments (review_status, created_at DESC)
  WHERE review_status = 'pending';

-- ── PLAN PRICING TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id              TEXT PRIMARY KEY,          -- 'standard' | 'pro'
  name_th         TEXT NOT NULL,
  price_monthly   NUMERIC(10,2) NOT NULL,
  features        JSONB NOT NULL DEFAULT '[]',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
