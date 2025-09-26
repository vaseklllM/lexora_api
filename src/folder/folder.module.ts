import { forwardRef, Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DatabaseModule } from 'src/database/database.module';
import { DeckModule } from 'src/deck/deck.module';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => DeckModule), CardModule],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
