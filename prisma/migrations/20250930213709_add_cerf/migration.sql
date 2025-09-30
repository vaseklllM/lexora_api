-- CreateEnum
CREATE TYPE "public"."Cefr" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "cefr" "public"."Cefr";
