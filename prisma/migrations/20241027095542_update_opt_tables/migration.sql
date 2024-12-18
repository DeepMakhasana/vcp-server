/*
  Warnings:

  - You are about to drop the `CreatorOtp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreatorOtp" DROP CONSTRAINT "CreatorOtp_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "UserOtp" DROP CONSTRAINT "UserOtp_userId_fkey";

-- DropTable
DROP TABLE "CreatorOtp";

-- DropTable
DROP TABLE "UserOtp";

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);
