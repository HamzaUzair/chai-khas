-- DropForeignKey
ALTER TABLE "dishes" DROP CONSTRAINT "dishes_category_id_fkey";

-- CreateIndex
CREATE INDEX "dishes_branch_id_category_id_is_available_idx" ON "dishes"("branch_id", "category_id", "is_available");

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
