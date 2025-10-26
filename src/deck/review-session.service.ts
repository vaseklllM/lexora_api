import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CardService } from 'src/card/card.service';
import { LearningStrategyFactory } from 'src/common/strategies/learning-strategy';
import { StartReviewSessionDto } from './dto/review-session/start.dto';
import { StartReviewSessionResponseDto } from './dto/review-session/start-response.dto';
import { StartReviewAllCardsSessionDto } from './dto/review-session/start-all.dto';
import { StartReviewAllCardsSessionResponseDto } from './dto/review-session/start-all-response.dto';
import { FinishReviewCardDto } from './dto/review-session/finish.dto';
import { FinishReviewCardResponseDto } from './dto/review-session/finish-response.dto';
import { REVIEW_SESSION_INTERVAL_MILLISECONDS } from 'src/common/config';

@Injectable()
export class ReviewSessionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cardService: CardService,
    private readonly learningStrategyFactory: LearningStrategyFactory,
  ) {}

  async startSession(
    userId: string,
    startReviewSessionDto: StartReviewSessionDto,
  ): Promise<StartReviewSessionResponseDto> {
    const deck = await this.databaseService.deck.findFirst({
      where: {
        id: startReviewSessionDto.deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

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

  async startAllCardsSession(
    userId: string,
    startReviewSessionDto: StartReviewAllCardsSessionDto,
  ): Promise<StartReviewAllCardsSessionResponseDto> {
    const deck = await this.databaseService.deck.findFirst({
      where: {
        id: startReviewSessionDto.deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

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

  async finishCard(
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
}
