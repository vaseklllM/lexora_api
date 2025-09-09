import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FolderModule } from 'src/folder/folder.module';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [FolderModule, DeckModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
