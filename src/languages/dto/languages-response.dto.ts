import { ApiProperty } from '@nestjs/swagger';
import { LanguageDto } from './language.dto';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LanguagesResponseDto {
  @ApiProperty({
    example: [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        iconSymbol: '🇺🇸',
      },
      {
        code: 'uk',
        name: 'Ukrainian',
        nativeName: 'Українська',
        iconSymbol: '🇺🇦',
      },
    ],
    description: 'Array of languages',
    type: [LanguageDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  data: LanguageDto[];
}
