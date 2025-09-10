import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export const DeckExample: DeckDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Deck name',
  languageWhatIKnow: 'uk',
  languageWhatILearn: 'en',
  numberOfCards: 32,
  numberOfNewCards: 10,
  numberOfCardsInProgress: 10,
  numberOfCardsNeedToReview: 10,
  numberOfCardsLearned: 2,
};

export class DeckDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'Deck name',
    description: 'Deck name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'uk',
    description: 'Language what I know',
  })
  @IsString()
  @IsNotEmpty()
  languageWhatIKnow: string;

  @ApiProperty({
    example: 'en',
    description: 'Language what I learn',
  })
  @IsString()
  @IsNotEmpty()
  languageWhatILearn: string;

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
}
