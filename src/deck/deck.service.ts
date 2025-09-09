import {
  ConflictException,
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

@Injectable()
export class DeckService {
  constructor(private readonly databaseService: DatabaseService) {}

  async get(userId: string, deckId: string): Promise<GetDeckResponseDto> {
    const findDeck = await this.checkIsExistDeck(userId, deckId);

    const numberOfCards = await this.databaseService.card.count({
      where: { deckId },
    });

    const numberOfNewCards = await this.databaseService.card.count({
      where: { deckId, isNew: true },
    });

    const numberOfCardsInProgress = await this.databaseService.card.count({
      where: { deckId, isNew: false },
    });

    return {
      id: findDeck.id,
      name: findDeck.name,
      languageWhatIKnow: findDeck.languageWhatIKnowId,
      languageWhatILearn: findDeck.languageWhatILearnId,
      numberOfCards: numberOfCards,
      numberOfNewCards: numberOfNewCards,
      numberOfCardsInProgress: numberOfCardsInProgress,
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

    await checkLanguageCode(createDeckDto.languageWhatIKnowId);
    await checkLanguageCode(createDeckDto.languageWhatILearnId);

    const deck = await this.databaseService.deck.create({
      data: {
        name: createDeckDto.name,
        userId,
        folderId: createDeckDto.folderId,
        languageWhatIKnowId: createDeckDto.languageWhatIKnowId,
        languageWhatILearnId: createDeckDto.languageWhatILearnId,
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
    const findDeck = await this.checkIsExistDeck(userId, renameDeckDto.deckId);

    if (findDeck.folderId) {
      const findDeckInFolder = await this.databaseService.deck.findFirst({
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
      const findDeckInUser = await this.databaseService.deck.findFirst({
        where: {
          userId,
          name: renameDeckDto.name,
        },
      });

      if (findDeckInUser) {
        throw new ConflictException(
          `Deck with name '${findDeckInUser.name}' already exists`,
        );
      }
    }

    const deck = await this.databaseService.deck.update({
      where: { id: renameDeckDto.deckId, userId },
      data: { name: renameDeckDto.name },
    });

    return {
      message: `Deck '${deck.name}' renamed successfully`,
    };
  }

  async delete(
    userId: string,
    deleteDeckDto: DeleteDeckDto,
  ): Promise<DeleteDeckResponseDto> {
    const findDeck = await this.checkIsExistDeck(userId, deleteDeckDto.deckId);

    await this.databaseService.deck.delete({
      where: { id: deleteDeckDto.deckId, userId },
    });

    return {
      message: `Deck '${findDeck.name}' deleted successfully`,
    };
  }
}
