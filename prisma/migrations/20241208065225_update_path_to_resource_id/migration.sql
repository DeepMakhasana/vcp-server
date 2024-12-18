/*
  Warnings:

  - You are about to drop the column `path` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Video` table. All the data in the column will be lost.
  - Added the required column `resourceId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "path",
ADD COLUMN     "resourceId" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "path",
ADD COLUMN     "resourceId" VARCHAR(100) NOT NULL;
