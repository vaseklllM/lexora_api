import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import {
  LanguageDto,
  languageEnExample,
  languageUkExample,
} from './language.dto';
import { Type } from 'class-transformer';

export class GetMyLanguagesResponseDto {
  @ApiProperty({
    example: [languageUkExample],
    description: 'Array of languages',
    type: [LanguageDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languagesWhatIKnow: LanguageDto[];

  @ApiProperty({
    example: [languageEnExample],
    description: 'Array of languages',
    type: [LanguageDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languagesWhatILearn: LanguageDto[];
}
