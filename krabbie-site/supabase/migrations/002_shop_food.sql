-- ============================================================
-- MIGRATION 002: Shop & QR Menu Tables + Demo Seed Data
-- วิธีรัน: วาง SQL นี้ใน Supabase SQL Editor แล้วกด Run
-- ============================================================


-- ════════════════════════════════════════════════
-- PART 1: NEW TABLES
-- ════════════════════════════════════════════════

-- ── Shop: Products ───────────────────────────────────────────
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  compare_price NUMERIC(10,2) CHECK (compare_price >= 0),
  stock         INT  NOT NULL DEFAULT -1,  -- -1 = unlimited
  image_emoji   TEXT NOT NULL DEFAULT '📦',
  category      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Shop: Orders ─────────────────────────────────────────────
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_ref      TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address        TEXT,
  items          JSONB NOT NULL DEFAULT '[]',
  total          NUMERIC(10,2) NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new','confirmed','shipped','delivered','cancelled')),
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── QR Menu: Categories ──────────────────────────────────────
CREATE TABLE menu_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '🍽️',
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── QR Menu: Items ───────────────────────────────────────────
CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_emoji  TEXT NOT NULL DEFAULT '🍽️',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular   BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── QR Menu: Table Orders ────────────────────────────────────
CREATE TABLE table_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_ref     TEXT NOT NULL UNIQUE,
  table_number  TEXT NOT NULL,
  customer_name TEXT,
  items         JSONB NOT NULL DEFAULT '[]',
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','preparing','served','paid')),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════
-- PART 2: ROW LEVEL SECURITY
-- ════════════════════════════════════════════════

ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_orders   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"      ON products        FOR SELECT USING (is_active = true);
CREATE POLICY "products_service_all"      ON products        FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "orders_anon_insert"        ON orders          FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_service_all"        ON orders          FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "menu_cats_public_read"     ON menu_categories FOR SELECT USING (true);
CREATE POLICY "menu_cats_service_all"     ON menu_categories FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "menu_items_public_read"    ON menu_items      FOR SELECT USING (is_available = true);
CREATE POLICY "menu_items_service_all"    ON menu_items      FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "table_orders_anon_insert"  ON table_orders    FOR INSERT WITH CHECK (true);
CREATE POLICY "table_orders_service_all"  ON table_orders    FOR ALL    USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════
-- PART 3: INDEXES
-- ════════════════════════════════════════════════

CREATE INDEX idx_products_tenant      ON products        (tenant_id, is_active, sort_order);
CREATE INDEX idx_orders_tenant        ON orders          (tenant_id, created_at DESC);
CREATE INDEX idx_orders_ref           ON orders          (order_ref);
CREATE INDEX idx_menu_cats_tenant     ON menu_categories (tenant_id, sort_order);
CREATE INDEX idx_menu_items_tenant    ON menu_items      (tenant_id, category_id, sort_order);
CREATE INDEX idx_table_orders_tenant  ON table_orders    (tenant_id, created_at DESC);


-- ════════════════════════════════════════════════
-- PART 4: TRIGGERS
-- ════════════════════════════════════════════════

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ════════════════════════════════════════════════
-- PART 5: SEED DATA
-- ════════════════════════════════════════════════

-- ── Demo tenant: The Corner Café (QR Menu) ───────────────────
INSERT INTO tenants (slug, name, template_id, owner_email, owner_phone, plan, trial_ends_at, settings)
VALUES (
  'corner-cafe',
  'The Corner Café',
  'food-qr-menu',
  'demo@krabbie.com',
  '0898765432',
  'trial',
  NOW() + INTERVAL '30 days',
  jsonb_build_object(
    'primaryColor', '#6F4E37',
    'logoUrl', null,
    'lineId', '@cornercafe',
    'lineNotify', false,
    'pushEnabled', false,
    'autoConfirm', true,
    'maxAdvanceDays', 30,
    'businessHours', jsonb_build_object(
      'monday',    jsonb_build_object('open', true, 'start', '08:00', 'end', '20:00'),
      'tuesday',   jsonb_build_object('open', true, 'start', '08:00', 'end', '20:00'),
      'wednesday', jsonb_build_object('open', true, 'start', '08:00', 'end', '20:00'),
      'thursday',  jsonb_build_object('open', true, 'start', '08:00', 'end', '20:00'),
      'friday',    jsonb_build_object('open', true, 'start', '08:00', 'end', '21:00'),
      'saturday',  jsonb_build_object('open', true, 'start', '08:00', 'end', '21:00'),
      'sunday',    jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00')
    )
  )
);

DO $$
DECLARE
  v_tid          UUID;
  v_cat_coffee   UUID;
  v_cat_noncoff  UUID;
  v_cat_desserts UUID;
  v_cat_food     UUID;
BEGIN
  SELECT id INTO v_tid FROM tenants WHERE slug = 'corner-cafe';

  INSERT INTO menu_categories (tenant_id, name, icon, sort_order) VALUES
    (v_tid, 'Coffee',     '☕', 1),
    (v_tid, 'Non-Coffee', '🧋', 2),
    (v_tid, 'Desserts',   '🍰', 3),
    (v_tid, 'Food',       '🥪', 4);

  SELECT id INTO v_cat_coffee   FROM menu_categories WHERE tenant_id = v_tid AND name = 'Coffee';
  SELECT id INTO v_cat_noncoff  FROM menu_categories WHERE tenant_id = v_tid AND name = 'Non-Coffee';
  SELECT id INTO v_cat_desserts FROM menu_categories WHERE tenant_id = v_tid AND name = 'Desserts';
  SELECT id INTO v_cat_food     FROM menu_categories WHERE tenant_id = v_tid AND name = 'Food';

  INSERT INTO menu_items (tenant_id, category_id, name, description, price, image_emoji, is_popular, sort_order) VALUES
    (v_tid, v_cat_coffee,   'Signature Latte',     'Espresso + oat milk + house syrup',           95,  '☕', true,  1),
    (v_tid, v_cat_coffee,   'Thai Coffee',          'กาแฟไทยสูตรพิเศษ คั่วบด ใส่นมข้น',            75,  '🫘', true,  2),
    (v_tid, v_cat_coffee,   'Cold Brew',            'Cold brew 18 ชม. เย็นสดชื่น',                90,  '🧊', false, 3),
    (v_tid, v_cat_coffee,   'Americano',            'Double shot espresso + water',                65,  '☕', false, 4),
    (v_tid, v_cat_coffee,   'Flat White',           'Ristretto + steamed oat milk เข้มกลมกล่อม',  90,  '☕', false, 5),
    (v_tid, v_cat_noncoff,  'Matcha Latte',         'Matcha ญี่ปุ่น + oat milk + honey',           95,  '🍵', true,  1),
    (v_tid, v_cat_noncoff,  'Thai Milk Tea',        'ชาไทยใบมะกรูด + นมสด เย็นๆ',                 70,  '🧋', true,  2),
    (v_tid, v_cat_noncoff,  'Fruit Soda',           'โซดาผลไม้สด Passion Fruit หรือ Lychee',       75,  '🍹', false, 3),
    (v_tid, v_cat_noncoff,  'Hojicha Latte',        'ชาเขียวคั่ว + นม เย็นชาชื่น',                 85,  '🍵', false, 4),
    (v_tid, v_cat_desserts, 'Basque Cheesecake',    'Creamy basque อบสดใหม่ทุกวัน',               120, '🍰', true,  1),
    (v_tid, v_cat_desserts, 'Mango Sticky Rice',    'ข้าวเหนียวมะม่วง ตำรับบ้านๆ',                 85,  '🥭', true,  2),
    (v_tid, v_cat_desserts, 'Toasted Waffle',       'วาฟเฟิลกรอบ + ice cream + maple syrup',      110, '🧇', false, 3),
    (v_tid, v_cat_desserts, 'Banana Bread',         'กล้วยหอมทอด + butter + ไอศกรีมวานิลลา',       90,  '🍌', false, 4),
    (v_tid, v_cat_food,     'Egg Toast',            'ขนมปังปิ้ง + ไข่ดาว + แฮม + ผักสด',           75,  '🍳', false, 1),
    (v_tid, v_cat_food,     'Club Sandwich',        'Club sandwich คลาสสิก 3 ชั้น + ไข้ + แฮม',   130, '🥪', true,  2),
    (v_tid, v_cat_food,     'Pasta Aglio Olio',     'Pasta กระเทียม + พริก + เบคอน อิตาเลียน',    145, '🍝', false, 3),
    (v_tid, v_cat_food,     'Granola Bowl',         'Granola + โยเกิร์ต + ผลไม้สด + honey',       110, '🥣', true,  4);
END $$;


-- ── Demo tenant: มินิมอล สตูดิโอ (Shop) ─────────────────────
INSERT INTO tenants (slug, name, template_id, owner_email, owner_phone, plan, trial_ends_at, settings)
VALUES (
  'minimal-studio',
  'มินิมอล สตูดิโอ',
  'shop-general',
  'demo@krabbie.com',
  '0923456789',
  'trial',
  NOW() + INTERVAL '30 days',
  jsonb_build_object(
    'primaryColor', '#1E293B',
    'logoUrl', null,
    'lineId', '@minimalstudio',
    'lineNotify', false,
    'pushEnabled', false,
    'autoConfirm', true,
    'maxAdvanceDays', 30,
    'businessHours', jsonb_build_object(
      'monday',    jsonb_build_object('open', true,  'start', '09:00', 'end', '18:00'),
      'tuesday',   jsonb_build_object('open', true,  'start', '09:00', 'end', '18:00'),
      'wednesday', jsonb_build_object('open', true,  'start', '09:00', 'end', '18:00'),
      'thursday',  jsonb_build_object('open', true,  'start', '09:00', 'end', '18:00'),
      'friday',    jsonb_build_object('open', true,  'start', '09:00', 'end', '18:00'),
      'saturday',  jsonb_build_object('open', true,  'start', '10:00', 'end', '17:00'),
      'sunday',    jsonb_build_object('open', false, 'start', '09:00', 'end', '18:00')
    )
  )
);

DO $$
DECLARE v_tid UUID;
BEGIN
  SELECT id INTO v_tid FROM tenants WHERE slug = 'minimal-studio';

  INSERT INTO products (tenant_id, name, description, price, compare_price, image_emoji, category, sort_order) VALUES
    (v_tid, 'แจกันเซรามิกมินิมอล',    'ปั้นด้วยมือ เผาดินสีครีม ทรงลูกแพร์ สูง 15 ซม.',           390,  450,  '🏺', 'เซรามิก',    1),
    (v_tid, 'ชุดแจกัน 3 ใบ',           'Set แจกันเซรามิก 3 ขนาด สไตล์ญี่ปุ่น-มินิมอล',             990,  1200, '🫙', 'เซรามิก',    2),
    (v_tid, 'ถ้วยชาเซรามิก',           'ถ้วย + จานรอง ปั้นมือ เคลือบ matte ขาวครีม',                290,  null, '🍵', 'เซรามิก',    3),
    (v_tid, 'เทียนหอม Sandalwood',     'เทียนถั่วหิน กลิ่น Sandalwood + Vanilla 200g',               280,  null, '🕯️', 'เทียน',      4),
    (v_tid, 'เทียนหอม Set 3 กลิ่น',   'Rose / Jasmine / Cedarwood 100g × 3 กล่อง Gift Box',         690,  800,  '🕯️', 'เทียน',      5),
    (v_tid, 'โมบายไม้ไผ่ Boho',       'โมบาย ไม้ไผ่แท้ ห้อยใบปาล์มแห้ง สไตล์ Boho',               350,  null, '🎋', 'ของตกแต่ง',  6),
    (v_tid, 'กรอบรูปไม้สัก',           'กรอบรูป 4×6" ไม้สักแท้ minimal ช่องใส่การ์ดพร้อม',           250,  null, '🖼️', 'ของตกแต่ง',  7),
    (v_tid, 'โคมไฟกระดาษข้าว',         'โคมไฟ Washi Paper ∅20 ซม. อุปกรณ์ครบพร้อมติดตั้ง',           490,  null, '🪔', 'ของตกแต่ง',  8),
    (v_tid, 'ผ้าพันคอถักมือ',          'Wool+Cotton 180×30 ซม. เลือกสี Oat / Sage / Mocha',           490,  null, '🧣', 'ผ้าและพรม', 9),
    (v_tid, 'กระเป๋าผ้า Crochet',     'กระเป๋าถักมือ ทรงตะกร้า ซิปล็อค หูหิ้ว',                     690,  null, '👜', 'ผ้าและพรม', 10),
    (v_tid, 'พรมทอมือกลม',             'พรมทอมือ ∅60 ซม. ลายเกลียว Bohemian สีธรรมชาติ',             950,  1200, '⭕', 'ผ้าและพรม', 11),
    (v_tid, 'เสื่อโยคะฝ้ายออร์แกนิค', 'Cotton organic 183×61 ซม. กันลื่น ล้างน้ำได้',               890,  null, '🧘', 'ผ้าและพรม', 12);
END $$;


-- ── Refresh time_slots สำหรับ sabaidee demo ──────────────────
-- ลบ slot เก่าที่ยังไม่ถูกจอง แล้ว generate ใหม่ 30 วัน ครบทุก service
DO $$
DECLARE
  v_tid UUID;
  rec   RECORD;
BEGIN
  SELECT id INTO v_tid FROM tenants WHERE slug = 'sabaidee';
  IF v_tid IS NULL THEN RETURN; END IF;

  DELETE FROM time_slots
  WHERE tenant_id = v_tid
    AND date < CURRENT_DATE
    AND is_booked = false;

  FOR rec IN
    SELECT id FROM services WHERE tenant_id = v_tid AND is_active = true
  LOOP
    PERFORM generate_upcoming_slots(v_tid, rec.id, 30);
  END LOOP;
END $$;


-- ════════════════════════════════════════════════
-- DONE ✓
-- ════════════════════════════════════════════════
