import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CardService } from 'src/card/card.service';
import { StartLearningSessionDto } from './dto/learning-session/start.dto';
import { StartLearningSessionResponseDto } from './dto/learning-session/start-response.dto';
import { FinishLearningSessionDto } from './dto/learning-session/finish.dto';
import { FinishLearningSessionResponseDto } from './dto/learning-session/finish-response.dto';

@Injectable()
export class LearningSessionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cardService: CardService,
  ) {}

  async startSession(
    userId: string,
    startLearningSessionDto: StartLearningSessionDto,
  ): Promise<StartLearningSessionResponseDto> {
    const deck = await this.databaseService.deck.findFirst({
      where: {
        id: startLearningSessionDto.deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const cards = await this.databaseService.card.findMany({
      where: {
        userId,
        deckId: startLearningSessionDto.deckId,
        isNew: true,
      },
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

  async finishSession(
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
}
