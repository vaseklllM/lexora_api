import { ApiProperty } from '@nestjs/swagger';
import { Cefr } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({
    example: Cefr.A1,
    description: 'CEFR level',
  })
  @IsEnum(Cefr)
  @IsNotEmpty()
  cefr: Cefr;
}
