-- AlterTable
ALTER TABLE "public"."Deck" ADD COLUMN     "languageWhatIKnowId" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "languageWhatILearnId" TEXT NOT NULL DEFAULT 'uk';

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "textInKnownLanguage" TEXT NOT NULL,
    "textInLearningLanguage" TEXT NOT NULL,
    "exampleInKnownLanguage" TEXT,
    "exampleInLearningLanguage" TEXT,
    "descriptionInKnownLanguage" TEXT,
    "descriptionInLearningLanguage" TEXT,
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_languageWhatIKnowId_fkey" FOREIGN KEY ("languageWhatIKnowId") REFERENCES "public"."Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_languageWhatILearnId_fkey" FOREIGN KEY ("languageWhatILearnId") REFERENCES "public"."Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
