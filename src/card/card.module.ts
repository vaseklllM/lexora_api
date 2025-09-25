import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { DatabaseModule } from 'src/database/database.module';
import { TtsModule } from 'src/tts/tts.module';

@Module({
  imports: [DatabaseModule, TtsModule],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
