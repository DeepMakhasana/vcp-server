/*
  Warnings:

  - You are about to drop the column `slug` on the `Creator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "slug" VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "slug";
