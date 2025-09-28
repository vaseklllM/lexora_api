/*
  Warnings:

  - You are about to drop the column `isSupportGoogleTtsVoiceFemaleGender` on the `Language` table. All the data in the column will be lost.
  - You are about to drop the column `isSupportGoogleTtsVoiceMaleGender` on the `Language` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Language" DROP COLUMN "isSupportGoogleTtsVoiceFemaleGender",
DROP COLUMN "isSupportGoogleTtsVoiceMaleGender",
ADD COLUMN     "googleTtsVoiceFemaleName" TEXT,
ADD COLUMN     "googleTtsVoiceMaleName" TEXT;
