import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FinishLearningSessionDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Card ids',
    isArray: true,
  })
  @IsString({ each: true })
  @IsNotEmpty()
  cardIds: string[];
}
