-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "branchId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "status" "MenuItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "sku" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_branchId_idx" ON "menu"("branchId");

-- CreateIndex
CREATE INDEX "menu_category_idx" ON "menu"("category");

-- CreateIndex
CREATE INDEX "menu_status_idx" ON "menu"("status");

-- CreateIndex
CREATE INDEX "menu_createdAt_idx" ON "menu"("createdAt");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;
