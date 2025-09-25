import { forwardRef, Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DatabaseModule } from 'src/database/database.module';
import { FolderModule } from 'src/folder/folder.module';
import { CardModule } from 'src/card/card.module';
@Module({
  imports: [DatabaseModule, forwardRef(() => FolderModule), CardModule],
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
