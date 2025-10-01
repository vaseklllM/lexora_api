import { ApiProperty } from '@nestjs/swagger';
import { Cefr } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_CARD_DESCRIPTION_LENGTH,
  MAX_CARD_WORD_LENGTH,
} from 'src/common/config';

export class CreateCardDto {
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
  })
  @IsString()
  @MinLength(2)
  @Matches(/^(?!\s*$).+/, {
    message: 'Cannot contain only spaces',
  })
  @IsNotEmpty({ message: 'Cannot be empty' })
  @MaxLength(MAX_CARD_WORD_LENGTH, {
    message: `Cannot be longer than ${MAX_CARD_WORD_LENGTH} characters`,
  })
  textInKnownLanguage: string;

  @ApiProperty({
    example: 'Book',
    description: 'Text in learning language',
  })
  @IsString()
  @MinLength(2)
  @Matches(/^(?!\s*$).+/, {
    message: 'Cannot contain only spaces',
  })
  @IsNotEmpty({ message: 'Cannot be empty' })
  @MaxLength(MAX_CARD_WORD_LENGTH, {
    message: `Cannot be longer than ${MAX_CARD_WORD_LENGTH} characters`,
  })
  textInLearningLanguage: string;

  @ApiProperty({
    example: 'Книга - это хорошо',
    description: 'Description in known language',
  })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_CARD_DESCRIPTION_LENGTH, {
    message: `Cannot be longer than ${MAX_CARD_DESCRIPTION_LENGTH} characters`,
  })
  descriptionInKnownLanguage?: string;

  @ApiProperty({
    example: 'Book is good',
    description: 'Description in learning language',
  })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_CARD_DESCRIPTION_LENGTH, {
    message: `Cannot be longer than ${MAX_CARD_DESCRIPTION_LENGTH} characters`,
  })
  descriptionInLearningLanguage?: string;

  @ApiProperty({
    example: Cefr.A1,
    description: 'CEFR level',
  })
  @IsEnum(Cefr)
  @IsNotEmpty()
  cefr: Cefr;
}
