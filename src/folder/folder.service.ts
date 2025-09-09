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

  private async checkIsExistFolder(userId: string, folderId: string) {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  private async getNumberOfCards(
    userId: string,
    folderId: string,
  ): Promise<number> {
    // Count cards directly in this folder
    const directCards: number = await this.databaseService.card.count({
      where: { userId, deck: { folderId: folderId } },
    });

    // Find all child folders
    const childFolders = await this.databaseService.folder.findMany({
      where: { userId, parentId: folderId },
    });

    // Recursively count cards in child folders
    let childCards = 0;
    for (const childFolder of childFolders) {
      childCards += await this.getNumberOfCards(userId, childFolder.id);
    }

    return directCards + childCards;
  }

  async get(userId: string, folderId: string): Promise<FolderResponseDto> {
    const folder = await this.checkIsExistFolder(userId, folderId);

    const parentFolders = await this.databaseService.folder.findMany({
      where: { userId, parentId: folder.id },
    });

    const numberOfCards = await this.getNumberOfCards(userId, folderId);

    return {
      name: folder.name,
      id: folder.id,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      numberOfCards: numberOfCards,
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
    if (createFolderDto.parentFolderId) {
      const parentFolder = await this.databaseService.folder.findFirst({
        where: {
          id: createFolderDto.parentFolderId,
        },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    const findFolderByName = await this.databaseService.folder.findFirst({
      where: {
        userId,
        name: createFolderDto.name,
        parentId: createFolderDto.parentFolderId ?? null,
      },
    });

    if (findFolderByName) {
      throw new ConflictException(
        `Folder with name '${findFolderByName.name}' already exists`,
      );
    }

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
    const findFolder = await this.databaseService.folder.findFirst({
      where: { id: renameFolderDto.id, userId },
    });

    if (!findFolder) {
      throw new NotFoundException('Folder not found');
    }

    if (findFolder.parentId) {
      const parentFolder = await this.databaseService.folder.findFirst({
        where: {
          parentId: findFolder.parentId,
          name: renameFolderDto.newName,
        },
      });

      if (parentFolder) {
        throw new ConflictException(
          `Folder with name '${parentFolder.name}' already exists`,
        );
      }
    } else {
      const sameNameFolder = await this.databaseService.folder.findFirst({
        where: {
          userId,
          name: renameFolderDto.newName,
        },
      });

      if (sameNameFolder) {
        throw new ConflictException(
          `Folder with name '${sameNameFolder.name}' already exists`,
        );
      }
    }

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

    // Recursively delete folder and all its content
    await this.deleteFolderRecursively(deleteFolderDto.id);

    return { message: 'Folder deleted successfully' };
  }

  private async deleteFolderRecursively(folderId: string): Promise<void> {
    // 1. Find all child folders
    const childFolders = await this.databaseService.folder.findMany({
      where: { parentId: folderId },
    });

    // 2. Recursively delete all child folders
    for (const childFolder of childFolders) {
      await this.deleteFolderRecursively(childFolder.id);
    }

    // 3. Delete all cards from decks in this folder
    await this.databaseService.card.deleteMany({
      where: { deck: { folderId } },
    });

    // 4. Delete all decks in this folder
    await this.databaseService.deck.deleteMany({
      where: { folderId },
    });

    // 5. Delete the folder itself
    await this.databaseService.folder.delete({
      where: { id: folderId },
    });
  }
}
