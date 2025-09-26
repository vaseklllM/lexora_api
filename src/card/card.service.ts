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

      // switch (languageCode) {
      //   case 'en': {
      //     const response = await fetch(
      //       `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      //     );

      //     if (!response.ok) {
      //       return [];
      //     }

      //     const data: { phonetics?: { audio?: string }[] }[] =
      //       await response.json();

      //     const audios: string[] = data
      //       .flatMap((item) =>
      //         item.phonetics?.map((phonetic) => phonetic.audio),
      //       )
      //       .filter((audio) => audio && audio.startsWith('https'))
      //       .filter(
      //         (audio, index, array) => array.indexOf(audio) === index,
      //       ) as string[];

      //     return audios.filter((_, idx) => idx < 3);
      //   }
      //   default:
      //     return [];
      // }
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

    const soundUrls = await this.getSoundUrls(
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

    const card = await this.checkIsExistCard(userId, cardId);
    const deck = await this.checkIsExistDeck(userId, card.deckId);

    const soundUrls = updateCardData.textInLearningLanguage
      ? await this.getSoundUrls(
          deck.languageWhatILearnCode,
          updateCardData.textInLearningLanguage,
        )
      : card.soundUrls;

    const newCard = await this.databaseService.card.update({
      where: { id: cardId },
      data: {
        ...updateCardData,
        soundUrls,
      },
    });

    return this.convertCardToGetCardResponseDto(newCard);
  }

  public async deleteSoundUrls(userId: string, cardId: string): Promise<void> {
    const card = await this.databaseService.card.findUnique({
      where: { userId, id: cardId },
      select: { soundUrls: true },
    });

    if (!card || !card.soundUrls || card.soundUrls.length === 0) {
      return;
    }

    for (const soundUrl of card.soundUrls) {
      const cardsWithSameSoundUrl = await this.databaseService.card.findMany({
        where: { soundUrls: { has: soundUrl }, id: { not: cardId } },
      });

      if (cardsWithSameSoundUrl.length > 0) {
        continue;
      }

      await this.ttsService.deleteSoundUrl(soundUrl);
    }
  }

  async delete(userId: string, cardId: string): Promise<DeleteCardResponseDto> {
    await this.checkIsExistCard(userId, cardId);

    await this.deleteSoundUrls(userId, cardId);

    const deletedCard = await this.databaseService.card.delete({
      where: { id: cardId },
    });

    return {
      message: `Card '${deletedCard.textInLearningLanguage}' deleted successfully`,
    };
  }
}
