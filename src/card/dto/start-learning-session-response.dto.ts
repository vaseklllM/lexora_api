import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { CardDto, CardExample } from './card.dto';

export class StartLearningSessionResponseDto {
  @ApiProperty({
    example: [CardExample],
    description: 'New cards for learning session',
  })
  @IsArray()
  @IsNotEmpty()
  cards: CardDto[];
}
