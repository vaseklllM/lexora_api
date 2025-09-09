import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';

@Injectable()
export class CardService {
  constructor(private readonly databaseService: DatabaseService) {}

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
    };
  }
}
