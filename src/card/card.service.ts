import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { CreateCardDto } from './dto/create.dto';
import { GetCardResponseDto } from './dto/get-card-response.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { UpdateCardDto } from './dto/update.dto';
import { Card } from '@prisma/client';
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
      cefr: card.cefr,
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

  private async generateSoundUrls(
    text: string,
    languageCode: string,
  ): Promise<string[]> {
    const language = await this.databaseService.language.findUnique({
      where: { code: languageCode },
      select: {
        googleTtsVoiceFemaleName: true,
        googleTtsVoiceMaleName: true,
      },
    });

    const result: string[] = [];

    function getName(names: string[]): string {
      // name[1] is the best quality, name[0] is normal quality
      return names[1] ?? names[0];
    }

    const promises: Promise<string>[] = [];

    // console.log(language);

    if (
      Array.isArray(language?.googleTtsVoiceFemaleName) &&
      language?.googleTtsVoiceFemaleName.length > 0
    ) {
      promises.push(
        this.ttsService.synthesizeText({
          text,
          languageCode,
          gender: 'female',
          name: getName(language.googleTtsVoiceFemaleName),
        }),
      );
    }

    if (
      Array.isArray(language?.googleTtsVoiceMaleName) &&
      language?.googleTtsVoiceMaleName.length > 0
    ) {
      promises.push(
        this.ttsService.synthesizeText({
          text,
          languageCode,
          gender: 'male',
          name: getName(language.googleTtsVoiceMaleName),
        }),
      );
    }

    const results = await Promise.all(promises);
    result.push(...results);

    return result;
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
            cefr: createCardDto.cefr,
          },
        });

        return {
          deck,
          card,
        };
      },
    );

    const soundUrls = await this.generateSoundUrls(
      createCardDto.textInLearningLanguage,
      transactionResult.deck.languageWhatILearnCode,
    );

    const card = await this.databaseService.card.update({
      where: { id: transactionResult.card.id },
      data: {
        soundUrls,
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
      await this.deleteUnuseSoundUrls(transactionResult.deleteSoundUrls);

      const soundUrls = await this.generateSoundUrls(
        updateCardData.textInLearningLanguage,
        transactionResult.deck.languageWhatILearnCode,
      );

      const newCard = await this.databaseService.card.update({
        where: { id: cardId },
        data: {
          soundUrls,
        },
      });

      return this.convertCardToGetCardResponseDto(newCard);
    }

    return this.convertCardToGetCardResponseDto(transactionResult.newCard);
  }

  public async deleteUnuseSoundUrls(soundUrls: string[]): Promise<void> {
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

    await this.deleteUnuseSoundUrls(soundUrls);

    return {
      message: `Card '${textInLearningLanguage}' deleted successfully`,
    };
  }
}
