import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DatabaseModule } from 'src/database/database.module';
import { VertexModule } from 'src/vertex/vertex.module';
import { VertexProvider } from 'src/vertex/vertex';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    DatabaseModule,
    VertexModule,
    HttpModule.register({ baseURL: process.env.SERVICE_AI_URL }),
  ],
  controllers: [AiController],
  providers: [AiService, VertexProvider],
})
export class AiModule {}
