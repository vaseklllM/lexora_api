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
import { DeckDto } from 'src/deck/dto/deck.dto';
import { DeckService } from 'src/deck/deck.service';

@Injectable()
export class FolderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly deckService: DeckService,
  ) {}

  private async checkIsExistFolder(userId: string, folderId: string) {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

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

  private async getDecksInFolder(
    userId: string,
    folderId: string,
  ): Promise<DeckDto[]> {
    const result = await this.databaseService.$queryRaw<
      Array<{
        id: string;
        name: string;
        languageWhatIKnowId: string;
        languageWhatILearnId: string;
        totalCards: bigint;
        newCards: bigint;
        cardsInProgress: bigint;
        cardsNeedReview: bigint;
      }>
    >`
      SELECT 
        d.id,
        d.name,
        d."languageWhatIKnowId",
        d."languageWhatILearnId",
        COALESCE(COUNT(c.id), 0) as "totalCards",
        COALESCE(COUNT(CASE WHEN c."isNew" = true THEN 1 END), 0) as "newCards",
        COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."masteryScore" > 0 AND c."masteryScore" < 100 THEN 1 END), 0) as "cardsInProgress",
        COALESCE(COUNT(CASE WHEN c."isNew" = false AND c."lastReviewedAt" < ${new Date(Date.now() - 1000 * 60 * 60 * 24)} THEN 1 END), 0) as "cardsNeedReview"
      FROM "Deck" d
      LEFT JOIN "Card" c ON d.id = c."deckId" AND c."userId" = ${userId}
      WHERE d."userId" = ${userId} AND d."folderId" = ${folderId}
      GROUP BY d.id, d.name, d."languageWhatIKnowId", d."languageWhatILearnId"
      ORDER BY d."createdAt" ASC
    `;

    return result.map((deck) => ({
      id: deck.id,
      name: deck.name,
      numberOfNewCards: Number(deck.newCards),
      numberOfCardsInProgress: Number(deck.cardsInProgress),
      numberOfCardsNeedToReview: Number(deck.cardsNeedReview),
      languageWhatIKnow: deck.languageWhatIKnowId,
      languageWhatILearn: deck.languageWhatILearnId,
      numberOfCards: Number(deck.totalCards),
    }));
  }

  async getFolders(userId: string, parentId?: string) {
    const parentFolders = await this.databaseService.folder.findMany({
      where: { userId, parentId: parentId ?? null },
    });

    return await Promise.all(
      parentFolders?.map(async (childFolder) => ({
        name: childFolder.name,
        id: childFolder.id,
        createdAt: childFolder.createdAt.toISOString(),
        updatedAt: childFolder.updatedAt.toISOString(),
        numberOfCards: await this.getNumberOfCardsInFolder(
          userId,
          childFolder.id,
        ),
      })) ?? [],
    );
  }

  async get(userId: string, folderId: string): Promise<FolderResponseDto> {
    const folder = await this.checkIsExistFolder(userId, folderId);

    const numberOfCards = await this.getNumberOfCardsInFolder(userId, folderId);

    return {
      name: folder.name,
      id: folder.id,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      numberOfCards: numberOfCards,
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
