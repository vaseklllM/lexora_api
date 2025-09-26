import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';
import { GetCardResponseDto } from './dto/get-card-response.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { UpdateCardDto } from './dto/update.dto';
import { Card, Deck } from '@prisma/client';
import { DeleteCardResponseDto } from './dto/delete-response.dto';
import { TtsService } from 'src/tts/tts.service';

@Injectable()
export class CardService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ttsService: TtsService,
  ) {}

  public convertCardToGetCardResponseDto(card: Card): GetCardResponseDto {
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
      soundUrls: card.soundUrls ?? [],
    };
  }

  private async getSoundUrls(
    languageCode: string,
    word: string,
  ): Promise<string[]> {
    try {
      const url = await this.ttsService.synthesizeText(word, languageCode);
      return [url];
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
    const transactionResult = await this.databaseService.$transaction(
      async (tx) => {
        const deck = await tx.deck.findFirst({
          where: { userId, id: createCardDto.deckId },
        });

        if (!deck) {
          throw new NotFoundException('Deck not found');
        }

        const card = await tx.card.create({
          data: {
            userId,
            textInKnownLanguage: createCardDto.textInKnownLanguage.trim(),
            textInLearningLanguage: createCardDto.textInLearningLanguage.trim(),
            descriptionInKnownLanguage:
              createCardDto.descriptionInKnownLanguage?.trim(),
            descriptionInLearningLanguage:
              createCardDto.descriptionInLearningLanguage?.trim(),
            deckId: createCardDto.deckId,
            soundUrls: [],
          },
        });

        return {
          deck,
          card,
        };
      },
    );

    const card = await this.databaseService.card.update({
      where: { id: transactionResult.card.id },
      data: {
        soundUrls: await this.getSoundUrls(
          transactionResult.deck.languageWhatILearnCode,
          createCardDto.textInLearningLanguage,
        ),
      },
    });

    return this.convertCardToGetCardResponseDto(card);
  }

  async update(
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<UpdateCardResponseDto> {
    const { cardId, ...updateCardData } = updateCardDto;

    const transactionResult = await this.databaseService.$transaction(
      async (tx) => {
        const card = await tx.card.findFirst({
          where: { userId, id: cardId },
        });

        if (!card) {
          throw new NotFoundException('Card not found');
        }

        const deck = await tx.deck.findFirst({
          where: { userId, id: card.deckId },
        });

        if (!deck) {
          throw new NotFoundException('Deck not found');
        }

        const isUpdatedLearningText =
          updateCardDto.textInLearningLanguage !== card.textInLearningLanguage;

        const newCard = await tx.card.update({
          where: { id: cardId },
          data: {
            ...updateCardData,
            soundUrls: isUpdatedLearningText ? [] : card.soundUrls,
          },
        });

        return {
          isUpdatedLearningText,
          deleteSoundUrls: isUpdatedLearningText ? card.soundUrls : [],
          deck,
          newCard,
        };
      },
    );

    if (transactionResult.isUpdatedLearningText) {
      await this.deleteSoundUrls(transactionResult.deleteSoundUrls);
      const newCard = await this.databaseService.card.update({
        where: { id: cardId },
        data: {
          soundUrls: await this.getSoundUrls(
            transactionResult.deck.languageWhatILearnCode,
            updateCardData.textInLearningLanguage,
          ),
        },
      });

      return this.convertCardToGetCardResponseDto(newCard);
    }

    return this.convertCardToGetCardResponseDto(transactionResult.newCard);
  }

  public async deleteSoundUrls(soundUrls: string[]): Promise<void> {
    for (const soundUrl of soundUrls) {
      const cardWithSameSoundUrl = await this.databaseService.card.findFirst({
        where: { soundUrls: { has: soundUrl } },
      });

      if (cardWithSameSoundUrl) {
        continue;
      }

      await this.ttsService.deleteSoundUrl(soundUrl);
    }
  }

  async delete(userId: string, cardId: string): Promise<DeleteCardResponseDto> {
    const { textInLearningLanguage, soundUrls } =
      await this.databaseService.$transaction(async (tx) => {
        const card = await tx.card.findFirst({
          where: { userId, id: cardId },
        });

        if (!card) {
          throw new NotFoundException('Card not found');
        }

        const deletedCard = await tx.card.delete({
          where: { id: cardId },
        });

        return {
          textInLearningLanguage: deletedCard.textInLearningLanguage,
          soundUrls: deletedCard.soundUrls,
        };
      });

    await this.deleteSoundUrls(soundUrls);

    return {
      message: `Card '${textInLearningLanguage}' deleted successfully`,
    };
  }
}
