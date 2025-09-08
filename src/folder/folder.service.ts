import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateFolderResponseDto } from './dto/create-folder-response.dto';
@Injectable()
export class FolderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<CreateFolderResponseDto> {
    const findFolderByName = await this.databaseService.folder.findFirst({
      where: {
        userId: userId,
        name: createFolderDto.name,
      },
    });

    if (findFolderByName) {
      throw new ConflictException(
        `Folder with name '${createFolderDto.name}' already exists`,
      );
    }

    const folder = await this.databaseService.folder.create({
      data: {
        name: createFolderDto.name,
        userId,
      },
    });

    return {
      name: folder.name,
      id: folder.id,
    };
  }
}
