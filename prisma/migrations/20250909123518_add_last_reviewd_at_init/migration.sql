/*
  Warnings:

  - Made the column `lastReviewedAt` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Card" ALTER COLUMN "lastReviewedAt" SET NOT NULL,
ALTER COLUMN "lastReviewedAt" SET DEFAULT CURRENT_TIMESTAMP;
