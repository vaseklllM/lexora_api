import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DatabaseModule } from 'src/database/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    DatabaseModule,
    HttpModule.register({ baseURL: process.env.SERVICE_AI_URL }),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
