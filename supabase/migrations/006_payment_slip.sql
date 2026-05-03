-- ============================================================
-- 006_PAYMENT_SLIP.SQL
-- เพิ่ม transaction_ref + storage bucket สำหรับสลิป
-- ============================================================

-- เพิ่ม column ป้องกันสลิปซ้ำ
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT UNIQUE,  -- unique ref จาก EasySlip
  ADD COLUMN IF NOT EXISTS verified_amount NUMERIC(10,2), -- ยอดจริงที่อ่านได้
  ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verify_method   TEXT,          -- 'easyslip' | 'claude_vision' | 'manual'
  ADD COLUMN IF NOT EXISTS verify_raw      JSONB;         -- raw response จาก verify API

-- index สำหรับตรวจ duplicate
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_ref
  ON payments (transaction_ref)
  WHERE transaction_ref IS NOT NULL;

-- ── STORAGE BUCKET ────────────────────────────────────────────
-- สร้าง bucket เก็บรูปสลิป (private — อ่านผ่าน signed URL เท่านั้น)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-slips',
  'payment-slips',
  false,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: ลูกค้า (anon) upload ได้, อ่านได้เฉพาะ service role
CREATE POLICY "slip_upload_anon"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'payment-slips');

CREATE POLICY "slip_read_service"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'payment-slips');

CREATE POLICY "slip_delete_service"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'payment-slips');
