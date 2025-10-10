/*
  Warnings:

  - You are about to alter the column `masteryScore` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Card" ALTER COLUMN "masteryScore" SET DATA TYPE DOUBLE PRECISION;
