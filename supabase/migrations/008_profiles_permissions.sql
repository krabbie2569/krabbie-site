-- ============================================================
-- 008_PROFILES_PERMISSIONS.SQL
-- Fix: permission denied for table profiles / seed_transactions
-- รัน SQL นี้ใน Supabase Dashboard → SQL Editor
-- ============================================================

-- ── PROFILES TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  seeds        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Service role: full access (bypasses RLS by default but explicit is safer)
DROP POLICY IF EXISTS "profiles_service_all" ON public.profiles;
CREATE POLICY "profiles_service_all"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated user: read and update own profile
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
CREATE POLICY "profiles_own_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── SEED_TRANSACTIONS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seed_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delta       INTEGER NOT NULL,
  note        TEXT,
  admin_email TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON TABLE public.seed_transactions TO postgres;
GRANT ALL ON TABLE public.seed_transactions TO service_role;
GRANT SELECT ON TABLE public.seed_transactions TO authenticated;

-- Enable RLS
ALTER TABLE public.seed_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seed_tx_service_all" ON public.seed_transactions;
CREATE POLICY "seed_tx_service_all"
  ON public.seed_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "seed_tx_own_select" ON public.seed_transactions;
CREATE POLICY "seed_tx_own_select"
  ON public.seed_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
