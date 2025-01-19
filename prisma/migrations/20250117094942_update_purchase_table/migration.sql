/*
  Warnings:

  - Added the required column `order_id` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "order_id" TEXT NOT NULL,
ADD COLUMN     "payment_id" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
