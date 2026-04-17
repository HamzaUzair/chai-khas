-- Remove the Printer / printers module entirely.
--
-- The Printer feature is no longer part of the product. This migration drops
-- the `printers` table and the `PrinterType` enum if they exist. Both
-- statements use `IF EXISTS` so the migration is safe to run on environments
-- where the table was never created (schema drift) as well as on fully
-- migrated databases.

DROP TABLE IF EXISTS "printers" CASCADE;

DROP TYPE IF EXISTS "PrinterType";
