/*
  Warnings:

  - You are about to drop the `TaskAccess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskAccess" DROP CONSTRAINT "TaskAccess_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAccess" DROP CONSTRAINT "TaskAccess_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "VideoAccess" DROP CONSTRAINT "VideoAccess_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "VideoAccess" DROP CONSTRAINT "VideoAccess_videoId_fkey";

-- DropTable
DROP TABLE "TaskAccess";

-- DropTable
DROP TABLE "VideoAccess";

-- CreateTable
CREATE TABLE "Progress" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
