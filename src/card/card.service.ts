import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';
import { GetCardResponseDto } from './dto/get-card-response.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { UpdateCardDto } from './dto/update.dto';
import { Card } from '@prisma/client';
import { DeleteCardResponseDto } from './dto/delete-response.dto';
import { StartLearningSessionDto } from './dto/start-learning-session.dto';
import { StartLearningSessionResponseDto } from './dto/start-learning-session-response.dto';
import { StartReviewSessionDto } from './dto/start-review-session.dto';
import { StartReviewSessionResponseDto } from './dto/start-review-session-response.dto';
import { FinishLearningSessionDto } from './dto/finish-learning-session.dto';
import { FinishLearningSessionResponseDto } from './dto/finish-learning-session-response.dto';

@Injectable()
export class CardService {
  constructor(private readonly databaseService: DatabaseService) {}

  private convertCardToGetCardResponseDto(card: Card): GetCardResponseDto {
    return {
      id: card.id,
      textInKnownLanguage: card.textInKnownLanguage,
      textInLearningLanguage: card.textInLearningLanguage,
      exampleInKnownLanguage: card.exampleInKnownLanguage ?? undefined,
      exampleInLearningLanguage: card.exampleInLearningLanguage ?? undefined,
      descriptionInKnownLanguage: card.descriptionInKnownLanguage ?? undefined,
      descriptionInLearningLanguage:
        card.descriptionInLearningLanguage ?? undefined,
      createdAt: card.createdAt.toISOString(),
      masteryScore: card.masteryScore,
      isNew: card.isNew,
    };
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

  private async checkIsExistDeck(userId: string, deckId: string) {
    const deck = await this.databaseService.deck.findFirst({
      where: { userId, id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
  }

  async create(
    userId: string,
    createCardDto: CreateCardDto,
  ): Promise<CreateCardResponseDto> {
    await this.checkIsExistDeck(userId, createCardDto.deckId);

    const card = await this.databaseService.card.create({
      data: {
        userId,
        ...createCardDto,
      },
    });

    return this.convertCardToGetCardResponseDto(card);
  }

  async update(
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<UpdateCardResponseDto> {
    const { cardId, ...updateCardData } = updateCardDto;

    await this.checkIsExistCard(userId, cardId);

    const card = await this.databaseService.card.update({
      where: { id: cardId },
      data: {
        ...updateCardData,
      },
    });

    return this.convertCardToGetCardResponseDto(card);
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
      where: { userId, deckId: startReviewSessionDto.deckId, isNew: false },
      take: startReviewSessionDto.count ?? 5,
    });

    return {
      cards: cards.map((card) => this.convertCardToGetCardResponseDto(card)),
    };
  }
}
