/*
  Warnings:

  - You are about to alter the column `masteryScore` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Card" ALTER COLUMN "masteryScore" SET DEFAULT 0,
ALTER COLUMN "masteryScore" SET DATA TYPE DECIMAL(5,2);
