-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isLogin" BOOLEAN;

-- CreateTable
CREATE TABLE "UserOtp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "UserOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorOtp" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "CreatorOtp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserOtp" ADD CONSTRAINT "UserOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorOtp" ADD CONSTRAINT "CreatorOtp_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
