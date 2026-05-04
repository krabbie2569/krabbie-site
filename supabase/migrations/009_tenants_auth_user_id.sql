-- ============================================================
-- 009_TENANTS_AUTH_USER_ID.SQL
-- Fix: เพิ่ม auth_user_id column ให้ tenants table
-- รัน SQL นี้ใน Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_auth_user_id
  ON public.tenants (auth_user_id);
