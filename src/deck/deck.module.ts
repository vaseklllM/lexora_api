import { forwardRef, Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DatabaseModule } from 'src/database/database.module';
import { FolderModule } from 'src/folder/folder.module';
import { CardModule } from 'src/card/card.module';
import { LanguagesModule } from 'src/languages/languages.module';
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => FolderModule),
    CardModule,
    LanguagesModule,
  ],
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
