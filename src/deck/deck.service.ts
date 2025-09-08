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
import { FolderService } from 'src/folder/folder.service';
import { DeleteDeckDto } from './dto/delete-deck.dto';
import { DeleteDeckResponseDto } from './dto/delete-deck-response.dto';

@Injectable()
export class DeckService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly folderService: FolderService,
  ) {}

  async checkIsExistDeck(userId: string, deckId: string) {
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
      await this.folderService.checkIsExistFolder(
        userId,
        createDeckDto.folderId,
      );
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

    const deck = await this.databaseService.deck.create({
      data: {
        name: createDeckDto.name,
        userId,
        folderId: createDeckDto.folderId,
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
