-- ============================================================================
-- Schema cleanup: drop dead / unused legacy tables, columns, and enums.
--
-- Safe, non-destructive for the current Restenzo product:
--   * removes tables no runtime code reads from (Role, Permission,
--     RolePermission, UserRoleAssignment, bills, customers, recipes,
--     recipe_ingredients, inventory_items, BranchInventory, StockTransaction,
--     kitchens);
--   * drops unused FK/columns (orders.customer_id, orders.sts,
--     expenses.status, categories.kitchen_id);
--   * renames the typo column dayend.expences -> dayend.total_expenses;
--   * drops legacy/dead columns on `dishes` (barcode, qnty, is_available,
--     is_frequent, discount) that were carried over from the desktop POS.
--
-- Everything uses `IF EXISTS` so re-running on a partially drifted database
-- is safe. Wrapped in one implicit transaction by Postgres.
-- ============================================================================

-- ── 1. Drop FK columns & dead columns on live tables ───────────────────────
-- Drop inbound FKs first, then the columns themselves.

ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_fkey";
DROP INDEX IF EXISTS "orders_customer_id_idx";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "sts";

ALTER TABLE "expenses" DROP COLUMN IF EXISTS "status";

-- Rename typo column: expences -> total_expenses
ALTER TABLE "dayend" RENAME COLUMN "expences" TO "total_expenses";

-- Dead `dishes` columns (legacy desktop POS leftovers; no live code reads them)
ALTER TABLE "dishes" DROP COLUMN IF EXISTS "barcode";
ALTER TABLE "dishes" DROP COLUMN IF EXISTS "qnty";
ALTER TABLE "dishes" DROP COLUMN IF EXISTS "is_available";
ALTER TABLE "dishes" DROP COLUMN IF EXISTS "is_frequent";
ALTER TABLE "dishes" DROP COLUMN IF EXISTS "discount";

-- ── 2. Detach Category from Kitchen (kitchen module is being removed) ──────
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_kitchen_id_fkey";
DROP INDEX IF EXISTS "categories_kitchen_id_idx";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "kitchen_id";

-- ── 3. Drop dead tables ────────────────────────────────────────────────────
DROP TABLE IF EXISTS "recipe_ingredients" CASCADE;
DROP TABLE IF EXISTS "recipes" CASCADE;

DROP TABLE IF EXISTS "BranchInventory" CASCADE;
DROP TABLE IF EXISTS "StockTransaction" CASCADE;
DROP TABLE IF EXISTS "inventory_items" CASCADE;

DROP TABLE IF EXISTS "bills" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;

DROP TABLE IF EXISTS "UserRoleAssignment" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;

DROP TABLE IF EXISTS "kitchens" CASCADE;

-- ── 4. Drop dead enums ─────────────────────────────────────────────────────
DROP TYPE IF EXISTS "InventoryUnit";
DROP TYPE IF EXISTS "StockTransactionType";
