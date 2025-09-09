import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CardDto, CardExample } from 'src/card/dto/card.dto';

export class GetDeckResponseDto {
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
    example: [CardExample],
    description: 'Cards',
  })
  @IsArray()
  @IsNotEmpty()
  cards: CardDto[];
}
