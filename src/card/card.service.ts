import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';
import { GetCardResponseDto } from './dto/get-card-response.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { UpdateCardDto } from './dto/update.dto';
import { Card } from '@prisma/client';
import { DeleteCardResponseDto } from './dto/delete-response.dto';
import { GetCardsToLearnDto } from './dto/get-cards-to-learn.dto';
import { GetCardsToLearnResponseDto } from './dto/get-cards-to-learn-response.dto';

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

  async getCardsToLearn(
    userId: string,
    getCardsToLearnDto: GetCardsToLearnDto,
  ): Promise<GetCardsToLearnResponseDto> {
    await this.checkIsExistDeck(userId, getCardsToLearnDto.deckId);

    const cards = await this.databaseService.card.findMany({
      where: { userId, deckId: getCardsToLearnDto.deckId, isNew: true },
      take: getCardsToLearnDto.count ?? 5,
    });

    return {
      cards: cards.map((card) => this.convertCardToGetCardResponseDto(card)),
    };
  }
}
