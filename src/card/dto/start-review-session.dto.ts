import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class StartReviewSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  deckId: string;

  @ApiProperty({
    example: 5,
    description: 'Number of cards for review session',
    required: false,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value) : undefined,
  )
  @IsNumber()
  @IsOptional()
  count?: number;
}
