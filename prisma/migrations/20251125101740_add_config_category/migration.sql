/*
  Warnings:

  - You are about to drop the column `category` on the `Config` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Config_category_idx";

-- AlterTable
ALTER TABLE "public"."Config" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."ConfigCategory" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigCategory_value_key" ON "public"."ConfigCategory"("value");

-- CreateIndex
CREATE INDEX "ConfigCategory_order_idx" ON "public"."ConfigCategory"("order");

-- CreateIndex
CREATE INDEX "Config_categoryId_idx" ON "public"."Config"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."Config" ADD CONSTRAINT "Config_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ConfigCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
