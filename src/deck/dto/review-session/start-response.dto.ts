import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CardDto, CardExample } from 'src/card/dto/card.dto';

export class StartReviewSessionResponseDto {
  @ApiProperty({
    type: [CardDto],
    example: [CardExample],
    description: 'Cards for review session',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];
}
