-- Add required city field for branch records.
ALTER TABLE "branches"
ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
