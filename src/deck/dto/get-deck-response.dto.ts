import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CardDto, CardExample } from 'src/card/dto/card.dto';
import { DeckDto } from './deck.dto';
import { Type } from 'class-transformer';

export class GetDeckResponseDto extends DeckDto {
  @ApiProperty({
    type: [CardDto],
    example: [CardExample],
    description: 'Cards',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];
}
