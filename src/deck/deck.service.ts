import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { CreateDeckResponseDto } from './dto/create-deck-response.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DeckService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async checkDeckName(args: {
    userId: string;
    name: string;
    folderId?: string;
  }): Promise<void> {
    if (args.folderId) {
      const folder = await this.databaseService.folder.findFirst({
        where: {
          userId: args.userId,
          id: args.folderId,
        },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    const deck = await this.databaseService.deck.findFirst({
      where: {
        userId: args.userId,
        name: args.name,
        folderId: args.folderId ?? null,
      },
    });

    if (deck) {
      throw new ConflictException(
        `Deck with name '${args.name}' already exists`,
      );
    }
  }

  async create(
    userId: string,
    createDeckDto: CreateDeckDto,
  ): Promise<CreateDeckResponseDto> {
    await this.checkDeckName({
      userId,
      name: createDeckDto.name,
      folderId: createDeckDto.folderId,
    });

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
}
