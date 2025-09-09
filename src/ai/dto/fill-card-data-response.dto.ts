import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FillCardDataResponseDto {
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
  @IsNotEmpty()
  exampleInKnownLanguage: string;

  @ApiProperty({
    example: 'I read a book',
    description: 'Example in learning language',
  })
  @IsString()
  @IsNotEmpty()
  exampleInLearningLanguage: string;

  @ApiProperty({
    example: 'Книга - это хорошо',
    description: 'Description in known language',
  })
  @IsString()
  @IsNotEmpty()
  descriptionInKnownLanguage: string;

  @ApiProperty({
    example: 'Book is good',
    description: 'Description in learning language',
  })
  @IsString()
  @IsNotEmpty()
  descriptionInLearningLanguage: string;
}
