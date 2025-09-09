import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DatabaseModule } from 'src/database/database.module';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [DatabaseModule, DeckModule],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
