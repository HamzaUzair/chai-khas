-- Day End: track business date + totals needed for history listing.

ALTER TABLE "dayend" ADD COLUMN IF NOT EXISTS "business_date" DATE;
ALTER TABLE "dayend" ADD COLUMN IF NOT EXISTS "total_orders" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "dayend" ADD COLUMN IF NOT EXISTS "cancelled_orders" INTEGER NOT NULL DEFAULT 0;

-- Backfill business_date for any pre-existing closures from closing_date_time.
UPDATE "dayend"
SET "business_date" = "closing_date_time"::date
WHERE "business_date" IS NULL;

ALTER TABLE "dayend" ALTER COLUMN "business_date" SET NOT NULL;
ALTER TABLE "dayend" ALTER COLUMN "business_date" SET DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS "dayend_business_date_idx" ON "dayend" ("business_date");

-- Drop any stray duplicates (keep the latest closure for each branch/day) before
-- adding the unique constraint. This is safe because history rows are
-- immutable snapshots; duplicates only exist if closure was hand-inserted.
DELETE FROM "dayend" d1
USING "dayend" d2
WHERE d1."branch_id" = d2."branch_id"
  AND d1."business_date" = d2."business_date"
  AND d1."id" < d2."id";

CREATE UNIQUE INDEX IF NOT EXISTS "dayend_branch_id_business_date_key"
  ON "dayend" ("branch_id", "business_date");
