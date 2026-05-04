-- ============================================================
-- 010_GRANT_ALL_TABLES.SQL
-- Fix: GRANT permissions ให้ service_role ทุก table
-- รัน SQL นี้ใน Supabase Dashboard → SQL Editor
-- ============================================================

GRANT ALL ON TABLE public.tenants           TO service_role;
GRANT ALL ON TABLE public.services          TO service_role;
GRANT ALL ON TABLE public.staff             TO service_role;
GRANT ALL ON TABLE public.time_slots        TO service_role;
GRANT ALL ON TABLE public.bookings          TO service_role;
GRANT ALL ON TABLE public.payments         TO service_role;
GRANT ALL ON TABLE public.templates         TO service_role;
GRANT ALL ON TABLE public.profiles          TO service_role;
GRANT ALL ON TABLE public.seed_transactions TO service_role;
GRANT ALL ON TABLE public.plans             TO service_role;

-- anon ต้องอ่าน tenants/services/templates ได้ (สำหรับหน้าร้านลูกค้า)
GRANT SELECT ON TABLE public.tenants   TO anon;
GRANT SELECT ON TABLE public.services  TO anon;
GRANT SELECT ON TABLE public.templates TO anon;
GRANT INSERT ON TABLE public.bookings  TO anon;
