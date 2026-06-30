-- ============================================================
-- Vestry — Phase 1 Initial Schema
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================


-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  is_default  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE items (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  uuid         REFERENCES categories(id) ON DELETE SET NULL,
  name         text         NOT NULL,
  brand        text,
  colour       text,
  price        numeric(10,2),
  image_url    text,
  source_url   text,        -- source product URL from Brave Search result
  notes        text,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

-- occasion is free text — UI suggests the 7 fixed values but accepts any string
CREATE TABLE outfits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  occasion    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outfit_items (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id  uuid  NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id    uuid  NOT NULL REFERENCES items(id)   ON DELETE CASCADE,
  UNIQUE (outfit_id, item_id)
);

-- outfit-level wear logging only; item times_worn is derived from this table
CREATE TABLE wear_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id   uuid        NOT NULL REFERENCES outfits(id)    ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worn_at     date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- global table — no user_id; populated by manual seed/script, not by users
CREATE TABLE trends (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text        NOT NULL,
  name        text        NOT NULL,
  brand       text,
  image_url   text,
  source_url  text,
  season      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_categories_user_id    ON categories(user_id);
CREATE INDEX idx_items_user_id         ON items(user_id);
CREATE INDEX idx_items_category_id     ON items(category_id);
CREATE INDEX idx_outfits_user_id       ON outfits(user_id);
CREATE INDEX idx_outfit_items_outfit   ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item     ON outfit_items(item_id);
CREATE INDEX idx_wear_logs_outfit      ON wear_logs(outfit_id);
CREATE INDEX idx_wear_logs_user        ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_worn_at     ON wear_logs(worn_at);
CREATE INDEX idx_trends_category       ON trends(category);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wear_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own categories"
  ON categories FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own items"
  ON items FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own outfits"
  ON outfits FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- outfit_items has no user_id — check via parent outfit
CREATE POLICY "users manage outfit_items for their outfits"
  ON outfit_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id      = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id      = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "users manage own wear_logs"
  ON wear_logs FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- trends: global read, no client writes
CREATE POLICY "trends are publicly readable"
  ON trends FOR SELECT USING (true);


-- ============================================================
-- DEFAULT CATEGORIES TRIGGER
-- Fires on every new Supabase Auth signup; creates the 7
-- seed categories so the closet is never empty on first login.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, is_default) VALUES
    (NEW.id, 'Tops',        true),
    (NEW.id, 'Bottoms',     true),
    (NEW.id, 'Shoes',       true),
    (NEW.id, 'Outerwear',   true),
    (NEW.id, 'Accessories', true),
    (NEW.id, 'Bags',        true),
    (NEW.id, 'Jewellery',   true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- VIEWS — derived metrics
-- security_invoker = true means each view respects the
-- calling user's RLS policies on the underlying tables.
-- ============================================================

-- item_stats
-- versatility_score = distinct outfits the item appears in
-- times_worn        = distinct wear_log rows for outfits containing this item
-- cost_per_wear     = price / times_worn  (NULL → UI shows ∞)
CREATE OR REPLACE VIEW item_stats
WITH (security_invoker = true)
AS
SELECT
  i.id                                        AS item_id,
  i.user_id,
  i.name,
  i.brand,
  i.colour,
  i.price,
  i.category_id,
  i.image_url,
  COUNT(DISTINCT oi.outfit_id)                AS versatility_score,
  COUNT(DISTINCT wl.id)                       AS times_worn,
  CASE
    WHEN i.price IS NULL              THEN NULL
    WHEN COUNT(DISTINCT wl.id) = 0   THEN NULL   -- UI renders as ∞
    ELSE ROUND(i.price / COUNT(DISTINCT wl.id), 2)
  END                                         AS cost_per_wear
FROM items i
LEFT JOIN outfit_items oi ON oi.item_id    = i.id
LEFT JOIN wear_logs    wl ON wl.outfit_id  = oi.outfit_id
GROUP BY i.id, i.user_id, i.name, i.brand, i.colour, i.price, i.category_id, i.image_url;


-- outfit_stats
-- times_worn = number of wear_log entries for this outfit
CREATE OR REPLACE VIEW outfit_stats
WITH (security_invoker = true)
AS
SELECT
  o.id           AS outfit_id,
  o.user_id,
  o.name,
  o.occasion,
  o.created_at,
  COUNT(wl.id)   AS times_worn
FROM outfits o
LEFT JOIN wear_logs wl ON wl.outfit_id = o.id
GROUP BY o.id, o.user_id, o.name, o.occasion, o.created_at;


-- gap_analysis
-- gap_score = outfit_appearances / item_count
-- Higher score → category is used in many outfits but has few items → bigger gap.
-- NULL gap_score means the category has no items and no outfit appearances (new/empty).
CREATE OR REPLACE VIEW gap_analysis
WITH (security_invoker = true)
AS
SELECT
  c.id                                                       AS category_id,
  c.user_id,
  c.name                                                     AS category_name,
  COUNT(DISTINCT i.id)                                       AS item_count,
  COUNT(DISTINCT oi.outfit_id)                               AS outfit_appearances,
  CASE
    WHEN COUNT(DISTINCT i.id) = 0 THEN NULL
    ELSE ROUND(
      COUNT(DISTINCT oi.outfit_id)::numeric /
      NULLIF(COUNT(DISTINCT i.id), 0),
      2
    )
  END                                                        AS gap_score
FROM categories c
LEFT JOIN items        i  ON i.category_id  = c.id AND i.user_id = c.user_id
LEFT JOIN outfit_items oi ON oi.item_id     = i.id
GROUP BY c.id, c.user_id, c.name;


-- ============================================================
-- TREND SEEDS (SS25)
-- Replace or extend this list each season.
-- ============================================================

INSERT INTO trends (category, name, brand, season) VALUES
  ('Tops',        'Linen Shirt',            'Totême',            'SS25'),
  ('Tops',        'Ribbed Tank',            'Skims',             'SS25'),
  ('Tops',        'Sheer Blouse',           'Reformation',       'SS25'),
  ('Bottoms',     'Barrel-Leg Jeans',       'Agolde',            'SS25'),
  ('Bottoms',     'Midi Slip Skirt',        'Sandro',            'SS25'),
  ('Bottoms',     'Tailored Shorts',        'The Frankie Shop',  'SS25'),
  ('Shoes',       'Ballet Flat',            'Jacquemus',         'SS25'),
  ('Shoes',       'Mary Jane Heel',         'Miu Miu',           'SS25'),
  ('Shoes',       'Clog Sandal',            'Birkenstock',       'SS25'),
  ('Outerwear',   'Trench Coat',            'Burberry',          'SS25'),
  ('Bags',        'Micro Tote',             'Polène',            'SS25'),
  ('Bags',        'Woven Shoulder Bag',     'Bottega Veneta',    'SS25'),
  ('Accessories', 'Silk Scarf',             'Hermès',            'SS25'),
  ('Jewellery',   'Layered Gold Necklace',  'Mejuri',            'SS25'),
  ('Jewellery',   'Sculptural Earrings',    'Sophie Buhai',      'SS25');
