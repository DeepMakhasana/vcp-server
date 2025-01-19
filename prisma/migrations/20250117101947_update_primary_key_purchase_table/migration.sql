/*
  Warnings:

  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Purchase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_purchaseId_fkey";

-- AlterTable
ALTER TABLE "Progress" ALTER COLUMN "purchaseId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY ("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_order_id_key" ON "Purchase"("order_id");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;
