import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { LanguagesModule } from './languages/languages.module';
import { FolderModule } from './folder/folder.module';
import { DeckModule } from './deck/deck.module';
import { CardModule } from './card/card.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { TtsModule } from './tts/tts.module';
import { VertexModule } from './vertex/vertex.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    AuthModule,
    RedisModule,
    LanguagesModule,
    FolderModule,
    DeckModule,
    CardModule,
    DashboardModule,
    AiModule,
    TtsModule,
    VertexModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
