import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateFolderResponseDto } from './dto/create-folder-response.dto';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { RenameFolderResponseDto } from './dto/rename-folder-response.dto';
@Injectable()
export class FolderService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async checkFolderName(userId: string, name: string) {
    const findFolderByName = await this.databaseService.folder.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (findFolderByName) {
      throw new ConflictException(`Folder with name '${name}' already exists`);
    }
  }

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<CreateFolderResponseDto> {
    await this.checkFolderName(userId, createFolderDto.name);

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

  async rename(
    userId: string,
    renameFolderDto: RenameFolderDto,
  ): Promise<RenameFolderResponseDto> {
    await this.checkFolderName(userId, renameFolderDto.newName);

    await this.databaseService.folder.update({
      where: { id: renameFolderDto.id },
      data: { name: renameFolderDto.newName },
    });

    return { message: 'Folder renamed successfully' };
  }
}
