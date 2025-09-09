import { Injectable } from '@nestjs/common';
import { GetDashboardResponseDto } from './dto/get-dashboard-response.dto';
import { FolderService } from 'src/folder/folder.service';
import { DeckService } from 'src/deck/deck.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly folderService: FolderService,
    private readonly deckService: DeckService,
  ) {}

  async getDashboard(userId: string): Promise<GetDashboardResponseDto> {
    return {
      childFolders: await this.folderService.getFolders(userId),
      childDecks: await this.deckService.getDecks(userId),
    };
  }
}
