import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';
import { GetCardResponseDto } from './dto/get-card-response.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { UpdateCardDto } from './dto/update.dto';
import { Card, Deck } from '@prisma/client';
import { DeleteCardResponseDto } from './dto/delete-response.dto';
import { StartLearningSessionDto } from './dto/start-learning-session.dto';
import { StartLearningSessionResponseDto } from './dto/start-learning-session-response.dto';
import { StartReviewSessionDto } from './dto/start-review-session.dto';
import { StartReviewSessionResponseDto } from './dto/start-review-session-response.dto';
import { FinishLearningSessionDto } from './dto/finish-learning-session.dto';
import { FinishLearningSessionResponseDto } from './dto/finish-learning-session-response.dto';
import { REVIEW_SESSION_INTERVAL_MINUTES } from 'src/common/config';
import { FinishReviewCardResponseDto } from './dto/finish-review-card-response.dto';
import { FinishReviewCardDto } from './dto/finish-review-card.dto';
import { LearningStrategyType } from 'src/common/types/learningStrategyType';

@Injectable()
export class CardService {
  constructor(private readonly databaseService: DatabaseService) {}

  private convertCardToGetCardResponseDto(card: Card): GetCardResponseDto {
    return {
      id: card.id,
      textInKnownLanguage: card.textInKnownLanguage,
      textInLearningLanguage: card.textInLearningLanguage,
      descriptionInKnownLanguage: card.descriptionInKnownLanguage ?? undefined,
      descriptionInLearningLanguage:
        card.descriptionInLearningLanguage ?? undefined,
      createdAt: card.createdAt.toISOString(),
      masteryScore: card.masteryScore,
      isNew: card.isNew,
      nativeSoundUrls: card.nativeSoundUrls ?? [],
    };
  }

  private async getNativeSoundUrls(
    languageCode: string,
    word: string,
  ): Promise<string[]> {
    try {
      switch (languageCode) {
        case 'en': {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
          );

          if (!response.ok) {
            return [];
          }

          const data: { phonetics?: { audio?: string }[] }[] =
            await response.json();

          const audios: string[] = data
            .flatMap((item) =>
              item.phonetics?.map((phonetic) => phonetic.audio),
            )
            .filter((audio) => audio && audio.startsWith('https'))
            .filter(
              (audio, index, array) => array.indexOf(audio) === index,
            ) as string[];

          return audios;
        }
        default:
          return [];
      }
    } catch (_error) {
      console.error(_error);
      return [];
    }
  }

  async get(userId: string, cardId: string): Promise<GetCardResponseDto> {
    const card = await this.databaseService.card.findFirst({
      where: { userId, id: cardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return this.convertCardToGetCardResponseDto(card);
  }

  private async checkIsExistCard(
    userId: string,
    cardId: string,
  ): Promise<Card> {
    const card = await this.databaseService.card.findFirst({
      where: { userId, id: cardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  private async checkIsExistDeck(
    userId: string,
    deckId: string,
  ): Promise<Deck> {
    const deck = await this.databaseService.deck.findFirst({
      where: { userId, id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    return deck;
  }

  async create(
    userId: string,
    createCardDto: CreateCardDto,
  ): Promise<CreateCardResponseDto> {
    const deck = await this.checkIsExistDeck(userId, createCardDto.deckId);

    const nativeSoundUrls = await this.getNativeSoundUrls(
      deck.languageWhatILearnCode,
      createCardDto.textInLearningLanguage,
    );

    const card = await this.databaseService.card.create({
      data: {
        userId,
        textInKnownLanguage: createCardDto.textInKnownLanguage.trim(),
        textInLearningLanguage: createCardDto.textInLearningLanguage.trim(),
        descriptionInKnownLanguage:
          createCardDto.descriptionInKnownLanguage?.trim(),
        descriptionInLearningLanguage:
          createCardDto.descriptionInLearningLanguage?.trim(),
        deckId: createCardDto.deckId,
        nativeSoundUrls,
      },
    });

    return this.convertCardToGetCardResponseDto(card);
  }

  async update(
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<UpdateCardResponseDto> {
    const { cardId, ...updateCardData } = updateCardDto;

    const card = await this.checkIsExistCard(userId, cardId);
    const deck = await this.checkIsExistDeck(userId, card.deckId);

    const nativeSoundUrls = updateCardData.textInLearningLanguage
      ? await this.getNativeSoundUrls(
          deck.languageWhatILearnCode,
          updateCardData.textInLearningLanguage,
        )
      : card.nativeSoundUrls;

    const newCard = await this.databaseService.card.update({
      where: { id: cardId },
      data: {
        ...updateCardData,
        nativeSoundUrls,
      },
    });

    return this.convertCardToGetCardResponseDto(newCard);
  }

  async delete(userId: string, cardId: string): Promise<DeleteCardResponseDto> {
    await this.checkIsExistCard(userId, cardId);

    const deletedCard = await this.databaseService.card.delete({
      where: { id: cardId },
    });

    return {
      message: `Card '${deletedCard.textInLearningLanguage}' deleted successfully`,
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
      cards: cards.map((card) => this.convertCardToGetCardResponseDto(card)),
    };
  }

  async finishLearningSession(
    userId: string,
    finishLearningSessionDto: FinishLearningSessionDto,
  ): Promise<FinishLearningSessionResponseDto> {
    await this.databaseService.card.updateMany({
      where: {
        userId,
        isNew: true,
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
          lt: new Date(
            Date.now() - 1000 * 60 * REVIEW_SESSION_INTERVAL_MINUTES,
          ),
        },
      },
    });

    if (cards.length === 0) {
      throw new NotFoundException('No cards to review');
    }

    return {
      cards: cards.map((card) => this.convertCardToGetCardResponseDto(card)),
    };
  }

  async finishReviewCard(
    userId: string,
    finishReviewCardDto: FinishReviewCardDto,
  ): Promise<FinishReviewCardResponseDto> {
    const card = await this.checkIsExistCard(
      userId,
      finishReviewCardDto.cardId,
    );

    function getCorrectWeight() {
      switch (finishReviewCardDto.typeOfStrategy) {
        case LearningStrategyType.PAIR_IT:
          return 1;

        case LearningStrategyType.GUESS_IT:
          return 2;

        case LearningStrategyType.RECALL_IT:
          return 3;

        case LearningStrategyType.TYPE_IT:
          return 4;

        default: {
          const _check: never = finishReviewCardDto.typeOfStrategy;
          throw new Error(`Unhandled learning strategy type: ${_check}`);
        }
      }
    }

    function getIncorrectWeight() {
      switch (finishReviewCardDto.typeOfStrategy) {
        case LearningStrategyType.PAIR_IT:
          return 4;

        case LearningStrategyType.GUESS_IT:
          return 3;

        case LearningStrategyType.RECALL_IT:
          return 2;

        case LearningStrategyType.TYPE_IT:
          return 1;

        default: {
          const _check: never = finishReviewCardDto.typeOfStrategy;
          throw new Error(`Unhandled learning strategy type: ${_check}`);
        }
      }
    }

    await this.databaseService.card.update({
      where: { id: finishReviewCardDto.cardId },
      data: finishReviewCardDto.isCorrectAnswer
        ? {
            lastReviewedAt: new Date(),
            masteryScore: ((): number | undefined => {
              const newScore: number = card.masteryScore + getCorrectWeight();

              return newScore > 100 ? 100 : newScore;
            })(),
          }
        : {
            masteryScore: ((): number | undefined => {
              const newScore: number = card.masteryScore - getIncorrectWeight();

              return newScore < 0 ? 0 : newScore;
            })(),
          },
    });

    return {
      message: 'Review card finished successfully',
    };
  }
}
