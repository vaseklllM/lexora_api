/*
  Warnings:

  - You are about to drop the column `exampleInKnownLanguage` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `exampleInLearningLanguage` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "exampleInKnownLanguage",
DROP COLUMN "exampleInLearningLanguage";
