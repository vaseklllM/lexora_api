-- AlterTable
ALTER TABLE "User" ADD COLUMN     "languageCode" TEXT NOT NULL DEFAULT 'en-US';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
