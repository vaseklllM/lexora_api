import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CardDto, CardExample } from './card.dto';
import { Type } from 'class-transformer';

export class StartLearningSessionResponseDto {
  @ApiProperty({
    type: [CardDto],
    example: [CardExample],
    description: 'New cards for learning session',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];
}
