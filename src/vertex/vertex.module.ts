import { Module } from '@nestjs/common';
import { VertexProvider } from './vertex';

@Module({
  providers: [VertexProvider],
  exports: [VertexProvider],
})
export class VertexModule {}
