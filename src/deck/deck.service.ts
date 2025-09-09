import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { CreateDeckResponseDto } from './dto/create-deck-response.dto';
import { DatabaseService } from 'src/database/database.service';
import { RenameDeckDto } from './dto/rename-deck.dto';
import { RenameDeckResponseDto } from './dto/rename-deck-response.dto';
import { DeleteDeckDto } from './dto/delete-deck.dto';
import { DeleteDeckResponseDto } from './dto/delete-deck-response.dto';
import { GetDeckResponseDto } from './dto/get-deck-response.dto';
import { REVIEW_SESSION_INTERVAL_MINUTES } from 'src/common/config';
import { CardDto } from 'src/card/dto/card.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeckService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDecks(userId: string, folderId?: string) {
    const folderCondition = folderId
      ? Prisma.sql`d."folderId" = ${folderId}`
      : Prisma.sql`d."folderId" IS NULL`;

    const result = await this.databaseService.$queryRaw<
      Array<{
        id: string;
        name: string;
        languageWhatIKnowId: string;
        languageWhatILearnId: string;
        totalCards: bigint;
        newCards: bigint;
        cardsInProgress: bigint;
        cardsNeedReview: bigint;
      }>
    >`
    SELECT 
      d.id,
      d.name,
      d."languageWhatIKnowId",
      d."languageWhatILearnId",
      COALESCE(COUNT(c.id), 0) as "totalCards",
      COALESCE(COUNT(CASE WHEN c."isNew" = true THEN 1 END), 0) as "newCards",
      COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."masteryScore" > 0 AND c."masteryScore" < 100 THEN 1 END), 0) as "cardsInProgress",
      COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."lastReviewedAt" < ${new Date(Date.now() - 1000 * 60 * 60 * 24)} THEN 1 END), 0) as "cardsNeedReview"
    FROM "Deck" d
    LEFT JOIN "Card" c ON d.id = c."deckId" AND c."userId" = ${userId}
    WHERE d."userId" = ${userId} AND ${folderCondition}
    GROUP BY d.id, d.name, d."languageWhatIKnowId", d."languageWhatILearnId"
    ORDER BY d."createdAt" ASC
  `;

    return result.map((deck) => ({
      id: deck.id,
      name: deck.name,
      numberOfNewCards: Number(deck.newCards),
      numberOfCardsInProgress: Number(deck.cardsInProgress),
      numberOfCardsNeedToReview: Number(deck.cardsNeedReview),
      languageWhatIKnow: deck.languageWhatIKnowId,
      languageWhatILearn: deck.languageWhatILearnId,
      numberOfCards: Number(deck.totalCards),
    }));
  }

  async getDeck(userId: string, deckId: string): Promise<GetDeckResponseDto> {
    const findDeck = await this.checkIsExistDeck(userId, deckId);

    const numberOfCards = await this.databaseService.card.count({
      where: { deckId },
    });

    const numberOfNewCards = await this.databaseService.card.count({
      where: { deckId, isNew: true },
    });

    const numberOfCardsInProgress = await this.databaseService.card.count({
      where: { deckId, isNew: false },
    });

    const numberOfCardsNeedToReview = await this.databaseService.card.count({
      where: {
        deckId,
        isNew: false,
        lastReviewedAt: {
          lt: new Date(
            Date.now() - 1000 * 60 * REVIEW_SESSION_INTERVAL_MINUTES,
          ),
        },
      },
    });

    const cards = await this.databaseService.card.findMany({
      where: { deckId },
    });

    return {
      id: findDeck.id,
      name: findDeck.name,
      languageWhatIKnow: findDeck.languageWhatIKnowCode,
      languageWhatILearn: findDeck.languageWhatILearnCode,
      numberOfCards: numberOfCards,
      numberOfNewCards: numberOfNewCards,
      numberOfCardsInProgress: numberOfCardsInProgress,
      numberOfCardsNeedToReview: numberOfCardsNeedToReview,
      cards: cards.map(
        (card): CardDto => ({
          id: card.id,
          textInKnownLanguage: card.textInKnownLanguage,
          textInLearningLanguage: card.textInLearningLanguage,
          exampleInKnownLanguage: card.exampleInKnownLanguage ?? undefined,
          exampleInLearningLanguage:
            card.exampleInLearningLanguage ?? undefined,
          createdAt: card.createdAt.toISOString(),
          masteryScore: card.masteryScore,
          isNew: card.isNew,
          descriptionInKnownLanguage:
            card.descriptionInKnownLanguage ?? undefined,
          descriptionInLearningLanguage:
            card.descriptionInLearningLanguage ?? undefined,
        }),
      ),
    };
  }

  private async checkIsExistFolder(userId: string, folderId: string) {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  private async checkIsExistDeck(userId: string, deckId: string) {
    const findDeck = await this.databaseService.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!findDeck) {
      throw new NotFoundException('Deck not found');
    }

    return findDeck;
  }

  async create(
    userId: string,
    createDeckDto: CreateDeckDto,
  ): Promise<CreateDeckResponseDto> {
    if (createDeckDto.folderId) {
      await this.checkIsExistFolder(userId, createDeckDto.folderId);
    }

    const findDeck = await this.databaseService.deck.findFirst({
      where: {
        userId,
        name: createDeckDto.name,
        folderId: createDeckDto.folderId ?? null,
      },
    });

    if (findDeck) {
      throw new ConflictException(
        `Deck with name '${findDeck.name}' already exists`,
      );
    }

    const checkLanguageCode = async (languageCode: string) => {
      const language = await this.databaseService.language.findFirst({
        where: { code: languageCode },
      });

      if (!language) {
        throw new NotFoundException(
          `Language with code '${languageCode}' not found`,
        );
      }

      return language;
    };

    await checkLanguageCode(createDeckDto.languageWhatIKnowCode);
    await checkLanguageCode(createDeckDto.languageWhatILearnCode);

    const deck = await this.databaseService.deck.create({
      data: {
        name: createDeckDto.name,
        userId,
        folderId: createDeckDto.folderId,
        languageWhatIKnowCode: createDeckDto.languageWhatIKnowCode,
        languageWhatILearnCode: createDeckDto.languageWhatILearnCode,
      },
    });

    return {
      name: deck.name,
      id: deck.id,
    };
  }

  async rename(
    userId: string,
    renameDeckDto: RenameDeckDto,
  ): Promise<RenameDeckResponseDto> {
    const findDeck = await this.checkIsExistDeck(userId, renameDeckDto.deckId);

    if (findDeck.folderId) {
      const findDeckInFolder = await this.databaseService.deck.findFirst({
        where: {
          folderId: findDeck.folderId,
          name: renameDeckDto.name,
        },
      });

      if (findDeckInFolder) {
        throw new ConflictException(
          `Deck with name '${findDeckInFolder.name}' already exists`,
        );
      }
    } else {
      const findDeckInUser = await this.databaseService.deck.findFirst({
        where: {
          userId,
          name: renameDeckDto.name,
        },
      });

      if (findDeckInUser) {
        throw new ConflictException(
          `Deck with name '${findDeckInUser.name}' already exists`,
        );
      }
    }

    const deck = await this.databaseService.deck.update({
      where: { id: renameDeckDto.deckId, userId },
      data: { name: renameDeckDto.name },
    });

    return {
      message: `Deck '${deck.name}' renamed successfully`,
    };
  }

  async delete(
    userId: string,
    deleteDeckDto: DeleteDeckDto,
  ): Promise<DeleteDeckResponseDto> {
    const findDeck = await this.checkIsExistDeck(userId, deleteDeckDto.deckId);

    await this.databaseService.card.deleteMany({
      where: { deckId: deleteDeckDto.deckId, userId },
    });

    await this.databaseService.deck.delete({
      where: { id: deleteDeckDto.deckId, userId },
    });

    return {
      message: `Deck '${findDeck.name}' deleted successfully`,
    };
  }
}
