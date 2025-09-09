/*
  Warnings:

  - You are about to drop the column `languageWhatIKnowId` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `languageWhatILearnId` on the `Deck` table. All the data in the column will be lost.
  - Added the required column `languageWhatIKnowCode` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageWhatILearnCode` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Deck" DROP CONSTRAINT "Deck_languageWhatIKnowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Deck" DROP CONSTRAINT "Deck_languageWhatILearnId_fkey";

-- AlterTable
ALTER TABLE "public"."Deck" DROP COLUMN "languageWhatIKnowId",
DROP COLUMN "languageWhatILearnId",
ADD COLUMN     "languageWhatIKnowCode" TEXT NOT NULL,
ADD COLUMN     "languageWhatILearnCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_languageWhatIKnowCode_fkey" FOREIGN KEY ("languageWhatIKnowCode") REFERENCES "public"."Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_languageWhatILearnCode_fkey" FOREIGN KEY ("languageWhatILearnCode") REFERENCES "public"."Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
