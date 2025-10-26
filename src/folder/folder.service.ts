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
import { CardService } from 'src/card/card.service';

@Injectable()
export class FolderService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => DeckService))
    private readonly deckService: DeckService,
    private readonly cardService: CardService,
  ) {}

  private async getNumberOfCardsInFolder(
    userId: string,
    folderId: string,
  ): Promise<number> {
    const result = await this.databaseService.$queryRaw<
      [{ count: bigint }]
    > /* sql */ `
      WITH RECURSIVE folder_tree AS (
        SELECT id FROM "Folder" WHERE id = ${folderId} AND "userId" = ${userId}
        
        UNION ALL
        
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
      include: {
        parent: true,
      },
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
        }),
      ) ?? [],
    );
  }

  public async getFolderBreadcrumbs(
    userId: string,
    folderId?: string | null,
  ): Promise<FolderBreadcrumbDto[]> {
    if (!folderId) return [];

    const breadcrumbs = await this.databaseService.$queryRaw<
      {
        id: string;
        name: string;
      }[]
    > /* sql */ `
      WITH RECURSIVE "breadcrumbs" AS (
        SELECT "id", "name", "parentId" FROM "Folder" WHERE "id" = ${folderId} AND "userId" = ${userId}
        
        UNION ALL	
        
        SELECT "ParentFolder"."id", "ParentFolder"."name", "ParentFolder"."parentId" FROM "Folder" AS "ParentFolder"
        JOIN "breadcrumbs" ON "ParentFolder"."id" = "breadcrumbs"."parentId"
        WHERE "breadcrumbs"."parentId" IS NOT NULL AND "ParentFolder"."userId" = ${userId}
      )
      SELECT "id", "name" FROM "breadcrumbs"
    `;

    return breadcrumbs.reverse();
  }

  async getFolder(
    userId: string,
    folderId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.databaseService.folder.findFirst({
      where: { userId, id: folderId },
      include: {
        parent: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const breadcrumbs = await this.getFolderBreadcrumbs(
      userId,
      folder.parentId,
    );

    return {
      name: folder.name,
      id: folder.id,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      parentFolder: folder.parent
        ? {
            name: folder.parent.name,
            id: folder.parent.id,
            createdAt: folder.parent.createdAt.toISOString(),
            updatedAt: folder.parent.updatedAt.toISOString(),
            numberOfCards: await this.getNumberOfCardsInFolder(
              userId,
              folder.parent.id,
            ),
          }
        : undefined,
      numberOfCards: await this.getNumberOfCardsInFolder(userId, folderId),
      breadcrumbs,
      childFolders: await this.getFolders(userId, folder.id),
      childDecks: await this.deckService.getDecks(userId, folder.id),
    };
  }

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<CreateFolderResponseDto> {
    return await this.databaseService.$transaction(async (tx) => {
      if (createFolderDto.parentFolderId) {
        const parentFolder = await tx.folder.findFirst({
          where: {
            id: createFolderDto.parentFolderId,
          },
        });

        if (!parentFolder) {
          throw new NotFoundException('Parent folder not found');
        }
      }

      const findFolderByName = await tx.folder.findFirst({
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

      const folder = await tx.folder.create({
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
    });
  }

  async rename(
    userId: string,
    renameFolderDto: RenameFolderDto,
  ): Promise<RenameFolderResponseDto> {
    await this.databaseService.$transaction(async (tx) => {
      const findFolder = await tx.folder.findFirst({
        where: { id: renameFolderDto.id, userId },
      });

      if (!findFolder) {
        throw new NotFoundException('Folder not found');
      }

      if (findFolder.parentId) {
        const parentFolder = await tx.folder.findFirst({
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
        const sameNameFolder = await tx.folder.findFirst({
          where: {
            userId,
            name: renameFolderDto.name,
            parentId: null,
          },
        });

        if (sameNameFolder) {
          throw new ConflictException(
            `Folder with name '${sameNameFolder.name}' already exists`,
          );
        }
      }

      await tx.folder.update({
        where: { id: renameFolderDto.id, userId },
        data: { name: renameFolderDto.name, updatedAt: new Date() },
      });
    });

    return { message: 'Folder renamed successfully' };
  }

  async delete(
    userId: string,
    deleteFolderDto: DeleteFolderDto,
  ): Promise<DeleteFolderResponseDto> {
    const transactionResult = await this.databaseService.$transaction(
      async (tx) => {
        const folder = await tx.folder.findUnique({
          where: { id: deleteFolderDto.id, userId },
        });

        if (!folder) {
          throw new NotFoundException('Folder not found');
        }

        async function getAllSoundUrlsInFolder(
          folderId: string,
        ): Promise<string[]> {
          const folderDecks = await tx.deck.findMany({
            where: { folderId },
            include: { cards: true },
          });

          let soundUrls: string[] = [];

          for (const deck of folderDecks) {
            for (const card of deck.cards) {
              soundUrls = [...soundUrls, ...card.soundUrls];
            }
          }

          const folderChilds = await tx.folder.findMany({
            where: { parentId: folderId },
          });

          for (const child of folderChilds) {
            const childSoundUrls = await getAllSoundUrlsInFolder(child.id);
            soundUrls = [...soundUrls, ...childSoundUrls];
          }

          return soundUrls;
        }

        const soundUrls = await getAllSoundUrlsInFolder(folder.id);

        await tx.folder.delete({
          where: { id: deleteFolderDto.id },
        });

        return {
          soundUrls,
        };
      },
    );

    await this.cardService.deleteUnuseSoundUrls(transactionResult.soundUrls);

    return { message: 'Folder deleted successfully' };
  }
}
