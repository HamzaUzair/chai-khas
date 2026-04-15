-- CreateEnum
CREATE TYPE "MenuItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "dishes" ADD COLUMN     "status" "MenuItemStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "dishes_status_idx" ON "dishes"("status");

-- CreateIndex
CREATE INDEX "dishes_created_at_idx" ON "dishes"("created_at");
