-- Live Kitchen timing: add real DB timestamps for the Running and Served
-- transitions so the preparation timer is authoritative (survives refresh,
-- available for reports, and no longer guessed from created_at).

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "kitchen_started_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "kitchen_served_at" TIMESTAMP(3);
