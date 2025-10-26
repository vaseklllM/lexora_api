import {
  ConflictException,
  forwardRef,
  Inject,
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
import { CardDto } from 'src/card/dto/card.dto';
import { Prisma } from '@prisma/client';
import { DeckDto } from './dto/deck.dto';
import { FolderService } from 'src/folder/folder.service';
import { StartLearningSessionDto } from './dto/start-learning-session.dto';
import { StartLearningSessionResponseDto } from './dto/start-learning-session-response.dto';
import { StartReviewSessionDto } from './dto/start-review-session.dto';
import { StartReviewSessionResponseDto } from './dto/start-review-session-response.dto';
import { FinishLearningSessionDto } from './dto/finish-learning-session.dto';
import { FinishLearningSessionResponseDto } from './dto/finish-learning-session-response.dto';
import { REVIEW_SESSION_INTERVAL_MILLISECONDS } from 'src/common/config';
import { FinishReviewCardResponseDto } from './dto/finish-review-card-response.dto';
import { FinishReviewCardDto } from './dto/finish-review-card.dto';
import { CardService } from 'src/card/card.service';
import { LanguagesService } from 'src/languages/languages.service';
import { MoveResponseDto } from './dto/move-response.dto';
import { MoveDto } from './dto/move.dto';
import { StartReviewAllCardsSessionDto } from './dto/start-review-all-cards-session.dto';
import { StartReviewAllCardsSessionResponseDto } from './dto/start-review-all-cards-session-response.dto';
import { LearningStrategyFactory } from 'src/common/strategies/learning-strategy.factory';

@Injectable()
export class DeckService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly cardService: CardService,
    private readonly languagesService: LanguagesService,
    private readonly learningStrategyFactory: LearningStrategyFactory,
  ) {}

  async getDecks(userId: string, folderId?: string): Promise<DeckDto[]> {
    const folderCondition = folderId
      ? Prisma.sql`d."folderId" = ${folderId}`
      : Prisma.sql`d."folderId" IS NULL`;

    const result = await this.databaseService.$queryRaw<
      Array<{
        id: string;
        name: string;
        languageWhatIKnowCode: string;
        languageWhatIKnowName: string;
        languageWhatIKnowNativeName: string;
        languageWhatIKnowIconSymbol: string;
        languageWhatIKnowGoogleTtsVoiceFemaleName: string[];
        languageWhatIKnowGoogleTtsVoiceMaleName: string[];
        languageWhatILearnCode: string;
        languageWhatILearnName: string;
        languageWhatILearnNativeName: string;
        languageWhatILearnIconSymbol: string;
        languageWhatILearnGoogleTtsVoiceFemaleName: string[];
        languageWhatILearnGoogleTtsVoiceMaleName: string[];
        totalCards: bigint;
        newCards: bigint;
        cardsInProgress: bigint;
        cardsNeedReview: bigint;
        cardsLearned: bigint;
        avgMasteryScore: number | null;
      }>
    >`
    SELECT 
      d.id,
      d.name,
      l_k."code" as "languageWhatIKnowCode",
      l_k."name" as "languageWhatIKnowName",
      l_k."nativeName" as "languageWhatIKnowNativeName",
      l_k."iconSymbol" as "languageWhatIKnowIconSymbol",
      l_k."googleTtsVoiceFemaleName" as "languageWhatIKnowGoogleTtsVoiceFemaleName",
      l_k."googleTtsVoiceMaleName" as "languageWhatIKnowGoogleTtsVoiceMaleName",
      l_l."code" as "languageWhatILearnCode",
      l_l."name" as "languageWhatILearnName",
      l_l."nativeName" as "languageWhatILearnNativeName",
      l_l."iconSymbol" as "languageWhatILearnIconSymbol",
      l_k."googleTtsVoiceFemaleName" as "languageWhatILearnGoogleTtsVoiceFemaleName",
      l_k."googleTtsVoiceMaleName" as "languageWhatILearnGoogleTtsVoiceMaleName",
      COALESCE(COUNT(c.id), 0) as "totalCards",
      COALESCE(COUNT(CASE WHEN c."isNew" = true THEN 1 END), 0) as "newCards",
      COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."masteryScore" > 0 AND c."masteryScore" < 100 THEN 1 END), 0) as "cardsInProgress",
      COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."lastReviewedAt" < ${new Date(Date.now() - REVIEW_SESSION_INTERVAL_MILLISECONDS)} AND c."masteryScore" < 100 THEN 1 END), 0) as "cardsNeedReview",
      COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."masteryScore" = 100 THEN 1 END), 0) as "cardsLearned",
      COALESCE(AVG(c."masteryScore"), 0) as "avgMasteryScore"
    FROM "Deck" d
    LEFT JOIN "Card" c ON d.id = c."deckId" AND c."userId" = ${userId}
    LEFT JOIN "Language" l_k ON d."languageWhatIKnowCode" = l_k."code"
    LEFT JOIN "Language" l_l ON d."languageWhatILearnCode" = l_l."code"
    WHERE d."userId" = ${userId} AND ${folderCondition}
    GROUP BY 
      d.id, d.name,
      l_k."code", l_k."name", l_k."nativeName", l_k."iconSymbol", l_k."googleTtsVoiceFemaleName", l_k."googleTtsVoiceMaleName",
      l_l."code", l_l."name", l_l."nativeName", l_l."iconSymbol", l_l."googleTtsVoiceFemaleName", l_l."googleTtsVoiceMaleName"
    ORDER BY d."createdAt" ASC
  `;

    return result.map(
      (deck): DeckDto => ({
        id: deck.id,
        name: deck.name,
        numberOfNewCards: Number(deck.newCards),
        numberOfCardsInProgress: Number(deck.cardsInProgress),
        numberOfCardsNeedToReview: Number(deck.cardsNeedReview),
        masteryScore: Math.floor(deck.avgMasteryScore ?? 0),
        numberOfCards: Number(deck.totalCards),
        numberOfCardsLearned: Number(deck.cardsLearned),
        languageWhatIKnow: this.languagesService.convertLanguageToLanguageDto({
          code: deck.languageWhatIKnowCode,
          name: deck.languageWhatIKnowName,
          nativeName: deck.languageWhatIKnowNativeName,
          iconSymbol: deck.languageWhatIKnowIconSymbol,
          googleTtsVoiceFemaleName:
            deck.languageWhatIKnowGoogleTtsVoiceFemaleName,
          googleTtsVoiceMaleName: deck.languageWhatIKnowGoogleTtsVoiceMaleName,
        }),
        languageWhatILearn: this.languagesService.convertLanguageToLanguageDto({
          code: deck.languageWhatILearnCode,
          name: deck.languageWhatILearnName,
          nativeName: deck.languageWhatILearnNativeName,
          iconSymbol: deck.languageWhatILearnIconSymbol,
          googleTtsVoiceFemaleName:
            deck.languageWhatILearnGoogleTtsVoiceFemaleName,
          googleTtsVoiceMaleName: deck.languageWhatILearnGoogleTtsVoiceMaleName,
        }),
      }),
    );
  }

  async getDeck(userId: string, deckId: string): Promise<GetDeckResponseDto> {
    const deck = await this.databaseService.deck.findFirst({
      where: { id: deckId, userId },
      include: {
        languageWhatIKnow: true,
        languageWhatILearn: true,
        cards: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const cards = deck.cards;

    const numberOfNewCards = cards.filter(
      (c) => c.isNew && c.masteryScore === 0,
    ).length;

    const numberOfCardsInProgress = cards.filter(
      (c) => !c.isNew && c.masteryScore >= 0 && c.masteryScore < 100,
    ).length;

    const numberOfCardsNeedToReview = cards.filter((c) => {
      const isExpired =
        c.lastReviewedAt <
        new Date(Date.now() - REVIEW_SESSION_INTERVAL_MILLISECONDS);
      return !c.isNew && isExpired && c.masteryScore < 100;
    }).length;

    const numberOfCardsLearned = cards.filter(
      (c) => !c.isNew && c.masteryScore === 100,
    ).length;

    const masteryScore =
      cards.length > 0
        ? cards.reduce((sum, c) => sum + c.masteryScore, 0) / cards.length
        : 0;

    return {
      id: deck.id,
      name: deck.name,
      languageWhatIKnow: this.languagesService.convertLanguageToLanguageDto(
        deck.languageWhatIKnow,
      ),
      languageWhatILearn: this.languagesService.convertLanguageToLanguageDto(
        deck.languageWhatILearn,
      ),
      numberOfCards: cards.length,
      numberOfNewCards: numberOfNewCards,
      numberOfCardsInProgress: numberOfCardsInProgress,
      numberOfCardsNeedToReview: numberOfCardsNeedToReview,
      numberOfCardsLearned: numberOfCardsLearned,
      masteryScore: Math.floor(masteryScore),
      foldersBreadcrumbs: await this.folderService.getFolderBreadcrumbs(
        userId,
        deck.folderId,
      ),
      cards: deck.cards.map(
        (card): CardDto => ({
          id: card.id,
          textInKnownLanguage: card.textInKnownLanguage,
          textInLearningLanguage: card.textInLearningLanguage,
          createdAt: card.createdAt.toISOString(),
          masteryScore: Math.floor(card.masteryScore),
          isNew: card.isNew,
          descriptionInKnownLanguage:
            card.descriptionInKnownLanguage ?? undefined,
          descriptionInLearningLanguage:
            card.descriptionInLearningLanguage ?? undefined,
          soundUrls: card.soundUrls ?? [],
          cefr: card.cefr ?? undefined,
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
    const deckName = await this.databaseService.$transaction(async (tx) => {
      const findDeck = await tx.deck.findFirst({
        where: { id: renameDeckDto.deckId, userId: userId },
      });

      if (!findDeck) {
        throw new NotFoundException('Deck not found');
      }

      if (findDeck.folderId) {
        const findDeckInFolder = await tx.deck.findFirst({
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
        const findDeckInUser = await tx.deck.findFirst({
          where: {
            userId,
            name: renameDeckDto.name,
            folderId: null,
          },
        });

        if (findDeckInUser) {
          throw new ConflictException(
            `Deck with name '${findDeckInUser.name}' already exists`,
          );
        }
      }

      const deck = await tx.deck.update({
        where: { id: renameDeckDto.deckId, userId },
        data: { name: renameDeckDto.name },
      });

      return deck.name;
    });

    return {
      message: `Deck '${deckName}' renamed successfully`,
    };
  }

  async delete(
    userId: string,
    deleteDeckDto: DeleteDeckDto,
  ): Promise<DeleteDeckResponseDto> {
    const transactionResult = await this.databaseService.$transaction(
      async (tx) => {
        const findDeck = await tx.deck.findFirst({
          where: { id: deleteDeckDto.deckId, userId },
          include: {
            cards: true,
          },
        });

        if (!findDeck) {
          throw new NotFoundException('Deck not found');
        }

        await tx.deck.delete({
          where: { id: deleteDeckDto.deckId },
        });

        return {
          deckName: findDeck.name,
          soundUrls: findDeck.cards.flatMap((card) => card.soundUrls),
        };
      },
    );

    await this.cardService.deleteUnuseSoundUrls(transactionResult.soundUrls);

    return {
      message: `Deck '${transactionResult.deckName}' deleted successfully`,
    };
  }

  async move(userId: string, moveDto: MoveDto): Promise<MoveResponseDto> {
    await this.databaseService.$transaction(async (tx) => {
      const deck = await tx.deck.findFirst({
        where: { id: moveDto.deckId, userId },
      });

      if (!deck) {
        throw new NotFoundException('Deck not found');
      }

      if (!moveDto.toFolderId) {
        const findDeckInHome = await tx.deck.findFirst({
          where: { userId, name: deck.name, folderId: null },
        });

        if (findDeckInHome) {
          throw new ConflictException(
            `Deck with name '${findDeckInHome.name}' already exists in home folder`,
          );
        }

        await tx.deck.update({
          where: { id: moveDto.deckId },
          data: { folderId: null },
        });
      } else {
        const folder = await tx.folder.findFirst({
          where: { id: moveDto.toFolderId, userId },
        });

        if (!folder) {
          throw new NotFoundException('Folder not found');
        }

        const findDeckInFolder = await tx.deck.findFirst({
          where: { folderId: moveDto.toFolderId, name: deck.name },
        });

        if (findDeckInFolder) {
          throw new ConflictException(
            `Deck with name '${findDeckInFolder.name}' already exists in folder '${folder.name}'`,
          );
        }

        await tx.deck.update({
          where: { id: moveDto.deckId },
          data: { folderId: moveDto.toFolderId },
        });
      }
    });

    return {
      message: 'Successfully moved deck to folder',
    };
  }

  async startLearningSession(
    userId: string,
    startLearningSessionDto: StartLearningSessionDto,
  ): Promise<StartLearningSessionResponseDto> {
    await this.checkIsExistDeck(userId, startLearningSessionDto.deckId);

    const cards = await this.databaseService.card.findMany({
      where: { userId, deckId: startLearningSessionDto.deckId, isNew: true },
      take: startLearningSessionDto.count ?? 5,
    });

    if (cards.length === 0) {
      throw new NotFoundException('No cards to learn');
    }

    return {
      cards: cards.map((card) =>
        this.cardService.convertCardToGetCardResponseDto(card),
      ),
    };
  }

  async finishLearningSession(
    userId: string,
    finishLearningSessionDto: FinishLearningSessionDto,
  ): Promise<FinishLearningSessionResponseDto> {
    await this.databaseService.card.updateMany({
      where: {
        userId,
        id: { in: finishLearningSessionDto.cardIds },
      },
      data: { isNew: false },
    });

    return {
      message: 'Learning session finished successfully',
    };
  }

  async startReviewSession(
    userId: string,
    startReviewSessionDto: StartReviewSessionDto,
  ): Promise<StartReviewSessionResponseDto> {
    await this.checkIsExistDeck(userId, startReviewSessionDto.deckId);

    const cards = await this.databaseService.card.findMany({
      where: {
        userId,
        deckId: startReviewSessionDto.deckId,
        isNew: false,
        lastReviewedAt: {
          lt: new Date(Date.now() - REVIEW_SESSION_INTERVAL_MILLISECONDS),
        },
        masteryScore: {
          lt: 100,
        },
      },
    });

    if (cards.length === 0) {
      throw new NotFoundException('No cards to review');
    }

    return {
      cards: cards.map((card) =>
        this.cardService.convertCardToGetCardResponseDto(card),
      ),
    };
  }

  async finishReviewCard(
    userId: string,
    finishReviewCardDto: FinishReviewCardDto,
  ): Promise<FinishReviewCardResponseDto> {
    await this.databaseService.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { userId, id: finishReviewCardDto.cardId },
      });

      if (!card) {
        throw new NotFoundException('Card not found');
      }

      const strategy = this.learningStrategyFactory.getStrategy(
        finishReviewCardDto.typeOfStrategy,
      );

      const isReviewSession =
        card.lastReviewedAt <
        new Date(Date.now() - REVIEW_SESSION_INTERVAL_MILLISECONDS);

      await tx.card.update({
        where: { id: finishReviewCardDto.cardId },
        data: finishReviewCardDto.isCorrectAnswer
          ? {
              lastReviewedAt: new Date(),
              masteryScore: ((): number | undefined => {
                const weight = strategy.getCorrectWeight();
                const newScore: number =
                  card.masteryScore + (isReviewSession ? weight : weight / 5);

                return newScore > 100 ? 100 : newScore;
              })(),
            }
          : {
              masteryScore: ((): number | undefined => {
                const weight = strategy.getIncorrectWeight();
                const newScore: number = card.masteryScore - weight;

                return newScore < 0 ? 0 : newScore;
              })(),
            },
      });
    });

    return {
      message: 'Review card finished successfully',
    };
  }

  async startReviewAllCardsSession(
    userId: string,
    startReviewSessionDto: StartReviewAllCardsSessionDto,
  ): Promise<StartReviewAllCardsSessionResponseDto> {
    await this.checkIsExistDeck(userId, startReviewSessionDto.deckId);

    const cards = await this.databaseService.card.findMany({
      where: {
        userId,
        deckId: startReviewSessionDto.deckId,
        isNew: false,
      },
    });

    if (cards.length === 0) {
      throw new NotFoundException('No cards to review');
    }

    return {
      cards: cards.map((card) =>
        this.cardService.convertCardToGetCardResponseDto(card),
      ),
    };
  }
}
