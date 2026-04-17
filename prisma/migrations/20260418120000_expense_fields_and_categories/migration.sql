-- Expense operational fields + FK to user; seed standard categories.

ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "payment_method" TEXT;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Active';
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "expense_date" TIMESTAMP(3);
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER;

UPDATE "expenses" SET "status" = 'Active' WHERE "status" IS NULL;
UPDATE "expenses" SET "expense_date" = "created_at" WHERE "expense_date" IS NULL;

ALTER TABLE "expenses" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "expenses" ALTER COLUMN "expense_date" SET NOT NULL;
ALTER TABLE "expenses" ALTER COLUMN "expense_date" SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "expenses_expenseCategoryId_idx" ON "expenses"("expenseCategoryId");
CREATE INDEX IF NOT EXISTS "expenses_created_by_id_idx" ON "expenses"("created_by_id");

ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "expenses_created_by_id_fkey";
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ExpenseCategory" ("name", "created_at", "updated_at") VALUES
  ('Utilities', NOW(), NOW()),
  ('Supplies', NOW(), NOW()),
  ('Maintenance', NOW(), NOW()),
  ('Salary', NOW(), NOW()),
  ('Food', NOW(), NOW()),
  ('Rent', NOW(), NOW()),
  ('Other', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;
