/*
  Warnings:

  - Made the column `mobile` on table `Creator` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mobile` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Creator" ALTER COLUMN "mobile" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mobile" SET NOT NULL;
