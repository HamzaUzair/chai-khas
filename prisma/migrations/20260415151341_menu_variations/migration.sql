-- AlterTable
ALTER TABLE "menu" ADD COLUMN     "basePrice" DECIMAL(65,30),
ADD COLUMN     "hasVariations" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "menu_item_variations" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_variations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_item_variations_menuId_idx" ON "menu_item_variations"("menuId");

-- CreateIndex
CREATE INDEX "menu_item_variations_sortOrder_idx" ON "menu_item_variations"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_variations_menuId_name_key" ON "menu_item_variations"("menuId", "name");

-- AddForeignKey
ALTER TABLE "menu_item_variations" ADD CONSTRAINT "menu_item_variations_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
