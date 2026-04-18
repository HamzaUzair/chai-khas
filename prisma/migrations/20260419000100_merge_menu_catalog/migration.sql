-- ============================================================================
-- Merge the Menu catalog (`menu`) into the operational menu-items table
-- (`dishes`) and rename the unified table to `menu_items`.
--
-- Background:
--   * `menu` is the canonical table used by the Menu module UI:
--     (itemName, description, category [as text], price, hasVariations,
--      basePrice, sku, image, status, branchId).
--   * `dishes` is the table referenced by `order_items`, `deal_items`,
--     analytics, day-end top-selling items, etc. It was created earlier for
--     the desktop POS and uses snake_case + FK category_id.
--
--   Every time an order is placed for a menu row, the app lazily creates a
--   matching `dishes` row (see `findOrCreateDishForMenuItem` in orders API).
--   That means every actively-sold `menu` row already has a mirror in
--   `dishes`, but a catalog-only `menu` row (never ordered) has no mirror.
--
-- Strategy:
--   1. Add the menu-catalog columns to `dishes`.
--   2. Ensure each (branch_id, menu.category) has a matching row in
--      `categories` so the FK is satisfied after merge.
--   3. Upsert every `menu` row into `dishes` keyed by (branch_id, lower(name)).
--   4. Drop the existing FK `menu_item_variations -> menu` before repointing,
--      repoint rows to the equivalent `dishes.dish_id`, delete orphans.
--   5. Drop the `menu` table.
--   6. Rename `dishes` -> `menu_items`.
--   7. Re-establish FK `menu_item_variations -> menu_items`.
--   8. Mark synthetic variant rows (e.g. "Tea (Small)") created by the order
--      flow as `show_in_menu=false` so they don't leak into the Menu UI.
-- ============================================================================

-- ── 1. Add new columns to `dishes` ─────────────────────────────────────────
ALTER TABLE "dishes"
  ADD COLUMN IF NOT EXISTS "has_variations" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "base_price"     DECIMAL(65, 30),
  ADD COLUMN IF NOT EXISTS "sku"            TEXT,
  ADD COLUMN IF NOT EXISTS "image"          TEXT,
  ADD COLUMN IF NOT EXISTS "show_in_menu"   BOOLEAN NOT NULL DEFAULT TRUE;

-- ── 2. Make sure every distinct menu.category exists in `categories` ───────
INSERT INTO "categories" (name, description, branch_id, kid, terminal, created_at, updated_at)
SELECT DISTINCT
  TRIM(m.category) AS name,
  NULL,
  m."branchId",
  0,
  1,
  NOW(),
  NOW()
FROM "menu" m
WHERE COALESCE(TRIM(m.category), '') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "categories" c
    WHERE c.branch_id = m."branchId"
      AND LOWER(c.name) = LOWER(TRIM(m.category))
  );

-- ── 3a. Update already-mirrored `dishes` rows with catalog metadata ────────
UPDATE "dishes" d
SET
  has_variations = m."hasVariations",
  base_price     = m."basePrice",
  sku            = COALESCE(d.sku,   m.sku),
  image          = COALESCE(d.image, m.image),
  price          = m.price,
  description    = COALESCE(d.description, m.description),
  status         = m.status,
  updated_at     = NOW()
FROM "menu" m
WHERE d.branch_id = m."branchId"
  AND LOWER(d.name) = LOWER(m."itemName");

-- ── 3b. Insert `menu` rows that don't yet have a mirror in `dishes` ────────
INSERT INTO "dishes" (
  name, description, price, category_id, terminal, branch_id, status,
  has_variations, base_price, sku, image, show_in_menu, created_at, updated_at
)
SELECT
  m."itemName",
  m.description,
  m.price,
  (
    SELECT c.category_id
    FROM "categories" c
    WHERE c.branch_id = m."branchId"
      AND LOWER(c.name) = LOWER(TRIM(m.category))
    LIMIT 1
  ),
  1,
  m."branchId",
  m.status,
  m."hasVariations",
  m."basePrice",
  m.sku,
  m.image,
  TRUE,
  m."createdAt",
  m."updatedAt"
FROM "menu" m
WHERE NOT EXISTS (
  SELECT 1 FROM "dishes" d
  WHERE d.branch_id = m."branchId"
    AND LOWER(d.name) = LOWER(m."itemName")
)
AND EXISTS (
  SELECT 1 FROM "categories" c
  WHERE c.branch_id = m."branchId"
    AND LOWER(c.name) = LOWER(TRIM(m.category))
);

-- ── 4a. Drop the stale FK FIRST so we can repoint variations safely ────────
ALTER TABLE "menu_item_variations"
  DROP CONSTRAINT IF EXISTS "menu_item_variations_menuId_fkey";

-- ── 4b. Repoint menu_item_variations.menuId from menu.id to dishes.dish_id ─
UPDATE "menu_item_variations" v
SET "menuId" = d.dish_id
FROM "menu" m
JOIN "dishes" d
  ON d.branch_id = m."branchId"
 AND LOWER(d.name) = LOWER(m."itemName")
WHERE v."menuId" = m.id;

-- ── 4c. Delete orphan variations that couldn't be repointed (e.g. menu row
--         whose category wasn't migrated). Removes dangling rows before we
--         add the new FK.
DELETE FROM "menu_item_variations" v
WHERE NOT EXISTS (
  SELECT 1 FROM "dishes" d WHERE d.dish_id = v."menuId"
);

-- ── 5. Drop the old `menu` table ───────────────────────────────────────────
DROP TABLE IF EXISTS "menu" CASCADE;

-- ── 6. Rename `dishes` -> `menu_items` ─────────────────────────────────────
ALTER TABLE "dishes" RENAME TO "menu_items";

-- Keep index names consistent with the new table name so pg_dump output is
-- tidy and future Prisma migrations diff cleanly.
ALTER INDEX IF EXISTS "dishes_pkey"                                   RENAME TO "menu_items_pkey";
ALTER INDEX IF EXISTS "dishes_branch_id_idx"                          RENAME TO "menu_items_branch_id_idx";
ALTER INDEX IF EXISTS "dishes_category_id_idx"                        RENAME TO "menu_items_category_id_idx";
ALTER INDEX IF EXISTS "dishes_status_idx"                             RENAME TO "menu_items_status_idx";
ALTER INDEX IF EXISTS "dishes_created_at_idx"                         RENAME TO "menu_items_created_at_idx";
ALTER INDEX IF EXISTS "dishes_branch_id_terminal_idx"                 RENAME TO "menu_items_branch_id_terminal_idx";
ALTER INDEX IF EXISTS "dishes_branch_id_category_id_is_available_idx" RENAME TO "menu_items_branch_id_category_id_idx";

-- ── 7. Re-establish FK from menu_item_variations -> menu_items ─────────────
ALTER TABLE "menu_item_variations"
  ADD CONSTRAINT "menu_item_variations_menuId_fkey"
  FOREIGN KEY ("menuId") REFERENCES "menu_items"("dish_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 8. Hide synthetic variant rows ("Name (VariationName)") from menu UI ──
-- These were created by the order flow when a variation was chosen; they
-- shouldn't appear in the Menu module listing (the canonical parent does).
UPDATE "menu_items" mi
SET show_in_menu = FALSE
WHERE mi.name ~ '\s\([^)]+\)\s*$'
  AND EXISTS (
    SELECT 1
    FROM "menu_items" parent
    WHERE parent.branch_id = mi.branch_id
      AND LOWER(parent.name) = LOWER(regexp_replace(mi.name, '\s\([^)]+\)\s*$', ''))
      AND parent.has_variations = TRUE
  );
