-- ============================================================
-- 009_AUTH.SQL — Link Supabase Auth users to tenants
-- ============================================================

-- Link auth user to tenant (set after signup creates auth user)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_auth_user_id ON tenants(auth_user_id);

-- Update pro plan price 390 → 299
UPDATE plans SET price_monthly = 299.00 WHERE id = 'pro';

-- Update plan_type constraint to include trial (for clarity)
-- trial = still in 14-day trial, standard = paid 150, pro = paid 299
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plan_type_check;
ALTER TABLE tenants
  ADD CONSTRAINT tenants_plan_type_check
  CHECK (plan_type IN ('trial', 'standard', 'pro'));

-- Set existing trial tenants to plan_type = 'trial'
UPDATE tenants SET plan_type = 'trial' WHERE plan = 'trial' AND plan_type = 'standard';

-- RLS: tenants can read their own row via auth_user_id
CREATE POLICY IF NOT EXISTS "tenant owner read own" ON tenants
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY IF NOT EXISTS "tenant owner update own" ON tenants
  FOR UPDATE USING (auth.uid() = auth_user_id);
