import { ApiProperty } from '@nestjs/swagger';
import {
  LanguageDto,
  languageEnExample,
  languageUkExample,
} from './language.dto';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LanguagesResponseDto {
  @ApiProperty({
    example: [languageEnExample, languageUkExample],
    description: 'Array of languages',
    type: [LanguageDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  data: LanguageDto[];
}
