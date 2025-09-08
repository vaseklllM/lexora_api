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

@Injectable()
export class DeckService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    userId: string,
    createDeckDto: CreateDeckDto,
  ): Promise<CreateDeckResponseDto> {
    if (createDeckDto.folderId) {
      const folder = await this.databaseService.folder.findFirst({
        where: {
          userId,
          id: createDeckDto.folderId,
        },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
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
    const deck = await this.databaseService.deck.update({
      where: { id: renameDeckDto.deckId, userId },
      data: { name: renameDeckDto.name },
    });

    return {
      message: `Deck '${deck.name}' renamed successfully`,
    };
  }
}
