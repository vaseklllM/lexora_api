import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FinishLearningSessionDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Card ids',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  cardIds: string[];
}
