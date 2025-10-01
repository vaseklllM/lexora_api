/*
  Warnings:

  - Made the column `cefr` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Card" ALTER COLUMN "cefr" SET NOT NULL;
