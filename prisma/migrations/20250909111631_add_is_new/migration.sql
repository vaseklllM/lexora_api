-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Deck" ALTER COLUMN "languageWhatIKnowId" DROP DEFAULT,
ALTER COLUMN "languageWhatILearnId" DROP DEFAULT;
