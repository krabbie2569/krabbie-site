-- ================================================================
-- 008_rental_template.sql
-- Tables for the "booking-rental" template (camera/clothes/item rental)
-- ================================================================

-- Rental items (cameras, clothes, equipment, etc.)
CREATE TABLE IF NOT EXISTS rental_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL DEFAULT 'other',    -- 'camera' | 'clothes' | 'other'
  price_per_day  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_per_day >= 0),
  hourly_pricing JSONB NOT NULL DEFAULT '[]',      -- [{hours:1, price:100}, ...]
  daily_pricing  JSONB NOT NULL DEFAULT '[]',      -- [{days:3, price:250}, ...]
  images         TEXT[] NOT NULL DEFAULT '{}',
  is_available   BOOLEAN NOT NULL DEFAULT true,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rental bookings (date-range based, not time-slot based)
CREATE TABLE IF NOT EXISTS rental_bookings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  item_id            UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
  date_from          DATE NOT NULL,
  date_to            DATE NOT NULL,
  customer_name      TEXT NOT NULL,
  customer_phone     TEXT NOT NULL,
  customer_email     TEXT,
  customer_instagram TEXT,
  customer_note      TEXT,
  total_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | cancelled
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rental_dates_valid CHECK (date_to >= date_from)
);

-- Rental reviews
CREATE TABLE IF NOT EXISTS rental_reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  images        TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rental_items_tenant   ON rental_items(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_tenant ON rental_bookings(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_item   ON rental_bookings(item_id, date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_rental_reviews_tenant  ON rental_reviews(tenant_id, created_at DESC);

-- RLS
ALTER TABLE rental_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_reviews  ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY "public read rental_items"
  ON rental_items FOR SELECT USING (is_available = true);

-- Service role full access
CREATE POLICY "service role rental_items"
  ON rental_items FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "public insert rental_bookings"
  ON rental_bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "public read own rental_bookings"
  ON rental_bookings FOR SELECT USING (true);

CREATE POLICY "service role rental_bookings"
  ON rental_bookings FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "public insert rental_reviews"
  ON rental_reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "public read rental_reviews"
  ON rental_reviews FOR SELECT USING (true);

CREATE POLICY "service role rental_reviews"
  ON rental_reviews FOR ALL USING (auth.role() = 'service_role');
