-- DropForeignKey
ALTER TABLE "public"."Deck" DROP CONSTRAINT "Deck_folderId_fkey";

-- AlterTable
ALTER TABLE "public"."Deck" ALTER COLUMN "folderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
