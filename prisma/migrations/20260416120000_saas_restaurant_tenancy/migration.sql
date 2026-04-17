-- ============================================================
--  SaaS multi-tenant refactor: introduce Restaurant root tenant.
--  - Adds Restaurant model
--  - Adds restaurant_id to Branch (required), User (optional) and Order (required)
--  - Backfills one Restaurant per existing Branch so historical data is preserved
--  - Renames BRANCH_ADMIN role to RESTAURANT_ADMIN
-- ============================================================

-- 1. Create restaurants table
CREATE TABLE "restaurants" (
  "restaurant_id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "restaurants_pkey" PRIMARY KEY ("restaurant_id")
);

CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");
CREATE INDEX "restaurants_status_idx" ON "restaurants"("status");

-- 2. Add restaurant_id columns (nullable first, fill, then enforce NOT NULL)
ALTER TABLE "branches" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "users"    ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "orders"   ADD COLUMN "restaurant_id" INTEGER;

-- 3. Backfill: one Restaurant per existing Branch (safe default, keeps tenancy isolated)
INSERT INTO "restaurants" ("name", "slug", "phone", "address", "status", "created_at", "updated_at")
SELECT
  b."branch_name",
  LOWER(b."branch_code") || '-r' || b."branch_id",
  b."phone",
  b."address",
  CASE WHEN b."status" = 'Inactive' THEN 'Inactive' ELSE 'Active' END,
  b."created_at",
  b."updated_at"
FROM "branches" b;

-- 4. Link branches to the restaurant we just created for them (by matching branch_code slug prefix)
UPDATE "branches" b
SET "restaurant_id" = r."restaurant_id"
FROM "restaurants" r
WHERE r."slug" = LOWER(b."branch_code") || '-r' || b."branch_id";

-- 5. Backfill users: inherit restaurant_id from their branch (if any)
UPDATE "users" u
SET "restaurant_id" = b."restaurant_id"
FROM "branches" b
WHERE u."branch_id" = b."branch_id";

-- 6. Backfill orders: inherit restaurant_id from their branch
UPDATE "orders" o
SET "restaurant_id" = b."restaurant_id"
FROM "branches" b
WHERE o."branch_id" = b."branch_id";

-- 7. Rename existing BRANCH_ADMIN role to RESTAURANT_ADMIN
UPDATE "users" SET "role" = 'RESTAURANT_ADMIN' WHERE "role" = 'BRANCH_ADMIN';

-- 8. Enforce NOT NULL on required tenancy columns
ALTER TABLE "branches" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "orders"   ALTER COLUMN "restaurant_id" SET NOT NULL;

-- 9. FKs and indexes
ALTER TABLE "branches"
  ADD CONSTRAINT "branches_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("restaurant_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users"
  ADD CONSTRAINT "users_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("restaurant_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("restaurant_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "branches_restaurant_id_idx" ON "branches"("restaurant_id");
CREATE INDEX "users_restaurant_id_idx"    ON "users"("restaurant_id");
CREATE INDEX "orders_restaurant_id_idx"   ON "orders"("restaurant_id");
CREATE INDEX "orders_restaurant_id_created_at_idx" ON "orders"("restaurant_id", "created_at");
