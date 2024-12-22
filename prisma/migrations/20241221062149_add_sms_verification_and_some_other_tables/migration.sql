/*
  Warnings:

  - A unique constraint covering the columns `[mobile]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "NumberVerificationOtp" (
    "id" SERIAL NOT NULL,
    "mobile" VARCHAR(10) NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "NumberVerificationOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedEmail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "VerifiedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedMobileNumber" (
    "id" SERIAL NOT NULL,
    "mobile" VARCHAR(10) NOT NULL,

    CONSTRAINT "VerifiedMobileNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedEmail_email_key" ON "VerifiedEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedMobileNumber_mobile_key" ON "VerifiedMobileNumber"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_mobile_key" ON "Creator"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_domain_key" ON "Creator"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");
