import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  LanguageDto,
  languageEnExample,
  languageUkExample,
} from 'src/languages/dto/language.dto';

export const DeckExample: DeckDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Deck name',
  languageWhatIKnow: languageUkExample,
  languageWhatILearn: languageEnExample,
  numberOfCards: 32,
  numberOfNewCards: 10,
  numberOfCardsInProgress: 10,
  numberOfCardsNeedToReview: 10,
  numberOfCardsLearned: 2,
  masteryScore: 52,
};

export class DeckDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Deck name',
    description: 'Deck name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: languageUkExample,
    description: 'Language what I know',
  })
  @Type(() => LanguageDto)
  @IsNotEmpty()
  languageWhatIKnow: LanguageDto;

  @ApiProperty({
    example: languageEnExample,
    description: 'Language what I learn',
  })
  @Type(() => LanguageDto)
  @IsNotEmpty()
  languageWhatILearn: LanguageDto;

  @ApiProperty({
    example: 10,
    description: 'Number of cards',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfCards: number;

  @ApiProperty({
    example: 10,
    description: 'Number of new cards',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfNewCards: number;

  @ApiProperty({
    example: 5,
    description: 'Number of cards in progress',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfCardsInProgress: number;

  @ApiProperty({
    example: 5,
    description: 'Number of cards need to review',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfCardsNeedToReview: number;

  @ApiProperty({
    example: 2,
    description: 'Number of cards learned',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfCardsLearned: number;

  @ApiProperty({
    example: 23,
    description: 'Deck mastery score',
  })
  @Min(0)
  @Max(100)
  @IsNumber()
  @IsNotEmpty()
  masteryScore: number;
}
