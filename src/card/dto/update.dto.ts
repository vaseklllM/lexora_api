import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCardDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Card id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  cardId: string;

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
}
