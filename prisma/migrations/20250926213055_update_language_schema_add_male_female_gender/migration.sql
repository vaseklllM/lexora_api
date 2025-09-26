-- AlterTable
ALTER TABLE "public"."Language" ADD COLUMN     "isSupportGoogleTtsVoiceFemaleGender" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSupportGoogleTtsVoiceMaleGender" BOOLEAN NOT NULL DEFAULT false;
