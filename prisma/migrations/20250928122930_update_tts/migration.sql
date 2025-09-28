/*
  Warnings:

  - The `googleTtsVoiceFemaleName` column on the `Language` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `googleTtsVoiceMaleName` column on the `Language` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Language" DROP COLUMN "googleTtsVoiceFemaleName",
ADD COLUMN     "googleTtsVoiceFemaleName" TEXT[],
DROP COLUMN "googleTtsVoiceMaleName",
ADD COLUMN     "googleTtsVoiceMaleName" TEXT[];
