import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { GetCardResponseDto } from './get-card-response.dto';

export class StartLearningSessionResponseDto {
  @ApiProperty({
    example: [
      {
        id: '55f91e44-19ba-4ad6-bffb-9fc216ba3ea9',
        textInKnownLanguage: 'мати, иметь',
        textInLearningLanguage: 'have',
        exampleInKnownLanguage: 'Я маю книгу',
        exampleInLearningLanguage: 'I have a book',
        createdAt: '2025-09-09T09:49:05.659Z',
        masteryScore: 0,
        isNew: true,
      },
    ],
    description: 'New cards for learning session',
  })
  @IsArray()
  @IsNotEmpty()
  cards: GetCardResponseDto[];
}
