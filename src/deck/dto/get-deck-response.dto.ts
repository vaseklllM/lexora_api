import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { CardDto, CardExample } from 'src/card/dto/card.dto';
import { DeckDto } from './deck.dto';

export class GetDeckResponseDto extends DeckDto {
  @ApiProperty({
    example: [CardExample],
    description: 'Cards',
  })
  @IsArray()
  @IsNotEmpty()
  cards: CardDto[];
}
