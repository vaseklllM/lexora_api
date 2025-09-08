import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateFolderResponseDto } from './dto/create-folder-response.dto';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { RenameFolderResponseDto } from './dto/rename-folder-response.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import { DeleteFolderResponseDto } from './dto/delete-folder-response.dto';
import { FolderResponseDto } from './dto/folder-response.dto';
@Injectable()
export class FolderService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async checkFolderName(
    userId: string,
    name: string,
    parentFolderId?: string,
  ) {
    if (parentFolderId) {
      const parentFolder = await this.databaseService.folder.findFirst({
        where: {
          id: parentFolderId,
        },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    const findFolderByName = await this.databaseService.folder.findFirst({
      where: {
        userId,
        name,
        parentId: parentFolderId ?? null,
      },
    });

    if (findFolderByName) {
      throw new ConflictException(`Folder with name '${name}' already exists`);
    }
  }

  async folder(userId: string, folderId: string): Promise<FolderResponseDto> {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const parentFolders = await this.databaseService.folder.findMany({
      where: { userId, parentId: folder.id },
    });

    return {
      name: folder.name,
      id: folder.id,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      numberOfCards: 0,
      childFolders:
        parentFolders?.map((folder) => ({
          name: folder.name,
          id: folder.id,
          createdAt: folder.createdAt.toISOString(),
          updatedAt: folder.updatedAt.toISOString(),
          numberOfCards: 0,
        })) ?? [],
    };
  }

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<CreateFolderResponseDto> {
    await this.checkFolderName(
      userId,
      createFolderDto.name,
      createFolderDto.parentFolderId,
    );

    const folder = await this.databaseService.folder.create({
      data: {
        name: createFolderDto.name,
        userId,
        parentId: createFolderDto.parentFolderId,
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
      where: { id: renameFolderDto.id, userId },
      data: { name: renameFolderDto.newName, updatedAt: new Date() },
    });

    return { message: 'Folder renamed successfully' };
  }

  async delete(
    userId: string,
    deleteFolderDto: DeleteFolderDto,
  ): Promise<DeleteFolderResponseDto> {
    const folder = await this.databaseService.folder.findUnique({
      where: { id: deleteFolderDto.id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.databaseService.folder.delete({
      where: { id: deleteFolderDto.id, userId },
    });

    return { message: 'Folder deleted successfully' };
  }
}
