import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCardResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Card id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'Книга',
    description: 'Text in known language',
  })
  @IsString()
  @IsNotEmpty()
  textInKnownLanguage: string;

  @ApiProperty({
    example: 'Book',
    description: 'Text in learning language',
  })
  @IsString()
  @IsNotEmpty()
  textInLearningLanguage: string;

  @ApiProperty({
    example: 'Я читаю книгу',
    description: 'Example in known language',
  })
  @IsString()
  @IsOptional()
  exampleInKnownLanguage?: string;

  @ApiProperty({
    example: 'I read a book',
    description: 'Example in learning language',
  })
  @IsString()
  @IsOptional()
  exampleInLearningLanguage?: string;

  @ApiProperty({
    example: 'Книга - это хорошо',
    description: 'Description in known language',
  })
  @IsString()
  @IsOptional()
  descriptionInKnownLanguage?: string;

  @ApiProperty({
    example: 'Book is good',
    description: 'Description in learning language',
  })
  @IsString()
  @IsOptional()
  descriptionInLearningLanguage?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Card creation date',
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;
}
