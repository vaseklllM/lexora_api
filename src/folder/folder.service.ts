import {
  ConflictException,
  forwardRef,
  Inject,
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
import {
  FolderBreadcrumbDto,
  FolderDto,
  FolderResponseDto,
} from './dto/folder-response.dto';
import { DeckService } from 'src/deck/deck.service';

@Injectable()
export class FolderService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => DeckService))
    private readonly deckService: DeckService,
  ) {}

  private async getNumberOfCardsInFolder(
    userId: string,
    folderId: string,
  ): Promise<number> {
    // Use raw SQL with recursive CTE to count all cards in folder and subfolders
    const result = await this.databaseService.$queryRaw<[{ count: bigint }]>`
      WITH RECURSIVE folder_tree AS (
        -- Base case: start with the target folder
        SELECT id FROM "Folder" WHERE id = ${folderId} AND "userId" = ${userId}
        
        UNION ALL
        
        -- Recursive case: find all child folders
        SELECT f.id 
        FROM "Folder" f
        INNER JOIN folder_tree ft ON f."parentId" = ft.id
        WHERE f."userId" = ${userId}
      )
      SELECT COUNT(*)::int as count
      FROM "Card" c
      INNER JOIN "Deck" d ON c."deckId" = d.id
      INNER JOIN folder_tree ft ON d."folderId" = ft.id
      WHERE c."userId" = ${userId}
    `;

    return Number(result[0]?.count || 0);
  }

  async getFolders(userId: string, parentId?: string) {
    const parentFolders = await this.databaseService.folder.findMany({
      where: { userId, parentId: parentId ?? null },
      orderBy: { updatedAt: 'desc' },
    });

    return await Promise.all(
      parentFolders?.map(
        async (childFolder): Promise<FolderDto> => ({
          id: childFolder.id,
          name: childFolder.name,
          createdAt: childFolder.createdAt.toISOString(),
          updatedAt: childFolder.updatedAt.toISOString(),
          numberOfCards: await this.getNumberOfCardsInFolder(
            userId,
            childFolder.id,
          ),
          parentFolderId: childFolder.parentId ?? undefined,
        }),
      ) ?? [],
    );
  }

  public async getFolderBreadcrumbs(
    userId: string,
    folderParentId?: string | null,
  ): Promise<FolderBreadcrumbDto[]> {
    if (!folderParentId) return [];

    const parentFolder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderParentId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!parentFolder) {
      throw new NotFoundException('Parent folder not found');
    }

    const parentFolders = [
      {
        name: parentFolder.name,
        id: parentFolder.id,
      },
    ];

    if (parentFolder.parentId) {
      parentFolders.unshift(
        ...(await this.getFolderBreadcrumbs(userId, parentFolder.parentId)),
      );
    }

    return parentFolders;
  }

  async getFolder(
    userId: string,
    folderId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return {
      name: folder.name,
      id: folder.id,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      parentFolderId: folder.parentId ?? undefined,
      numberOfCards: await this.getNumberOfCardsInFolder(userId, folderId),
      breadcrumbs: await this.getFolderBreadcrumbs(userId, folder.parentId),
      childFolders: await this.getFolders(userId, folder.id),
      childDecks: await this.deckService.getDecks(userId, folder.id),
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
          name: renameFolderDto.name,
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
          name: renameFolderDto.name,
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
      data: { name: renameFolderDto.name, updatedAt: new Date() },
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
      where: { id: deleteFolderDto.id },
    });

    return { message: 'Folder deleted successfully' };
  }
}
