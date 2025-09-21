import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class StartLearningSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  deckId: string;

  @ApiProperty({
    example: 5,
    description: 'Number of new cards to start learning',
    required: false,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value) : undefined,
  )
  @IsNumber()
  @IsOptional()
  count?: number;
}
