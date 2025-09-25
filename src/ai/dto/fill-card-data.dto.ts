import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FillCardDataDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  deckId: string;

  @ApiProperty({
    example: 'Книга',
    description: 'Text in known language',
    required: false,
  })
  @IsString()
  @IsOptional()
  textInKnownLanguage?: string;

  @ApiProperty({
    example: 'Book',
    description: 'Text in learning language',
    required: false,
  })
  @IsString()
  @IsOptional()
  textInLearningLanguage?: string;
}
