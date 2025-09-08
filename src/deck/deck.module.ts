import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DatabaseModule } from 'src/database/database.module';
import { FolderService } from 'src/folder/folder.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DeckController],
  providers: [DeckService, FolderService],
})
export class DeckModule {}
