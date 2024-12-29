-- CreateTable
CREATE TABLE "PublicVideo" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicVideo_lessonId_key" ON "PublicVideo"("lessonId");

-- AddForeignKey
ALTER TABLE "PublicVideo" ADD CONSTRAINT "PublicVideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
