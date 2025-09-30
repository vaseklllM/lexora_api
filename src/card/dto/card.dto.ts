import { ApiProperty } from '@nestjs/swagger';
import { Cefr } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export const CardExample: CardDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  textInKnownLanguage: 'Книга',
  textInLearningLanguage: 'Book',
  createdAt: '2023-01-01T00:00:00Z',
  masteryScore: 0,
  isNew: true,
  soundUrls: [
    'https://api.dictionaryapi.dev/media/pronunciations/en/book-au.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/book-us.mp3',
  ],
};

export class CardDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Card id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Книга',
    description: 'Text in known language',
  })
  @IsString()
  @IsNotEmpty()
  textInKnownLanguage: string;

  @ApiProperty({
    example: 'Book',
    description: 'Text in learning language',
  })
  @IsString()
  @IsNotEmpty()
  textInLearningLanguage: string;

  @ApiProperty({
    example: 'Книга - это хорошо',
    description: 'Description in known language',
  })
  @IsString()
  @IsOptional()
  descriptionInKnownLanguage?: string;

  @ApiProperty({
    example: 'Book is good',
    description: 'Description in learning language',
  })
  @IsString()
  @IsOptional()
  descriptionInLearningLanguage?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Card creation date',
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    example: 0,
    description: 'Card mastery score',
  })
  @IsNumber()
  @IsNotEmpty()
  masteryScore: number;

  @ApiProperty({
    example: true,
    description: 'Is new card',
  })
  @IsBoolean()
  @IsNotEmpty()
  isNew: boolean;

  @ApiProperty({
    example: [
      'https://api.dictionaryapi.dev/media/pronunciations/en/queue-au.mp3',
      'https://api.dictionaryapi.dev/media/pronunciations/en/queue-us.mp3',
    ],
    description: 'Native sound urls',
  })
  @IsString({ each: true })
  soundUrls: string[];

  @ApiProperty({
    example: Cefr.A1,
    description: 'CEFR level',
  })
  @IsEnum(Cefr)
  @IsOptional()
  cefr?: Cefr;
}
