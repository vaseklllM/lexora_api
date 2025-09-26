import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export const languageEnExample: LanguageDto = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  iconSymbol: '🇺🇸',
  isSupportGoogleTtsVoiceFemaleGender: true,
  isSupportGoogleTtsVoiceMaleGender: true,
};

export const languageUkExample: LanguageDto = {
  code: 'uk',
  name: 'Ukrainian',
  nativeName: 'Українська',
  iconSymbol: '🇺🇦',
  isSupportGoogleTtsVoiceFemaleGender: true,
  isSupportGoogleTtsVoiceMaleGender: false,
};

export class LanguageDto {
  @ApiProperty({
    example: 'en',
    description: 'Language code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'English',
    description: 'Language name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'English',
    description: 'Language native name',
  })
  @IsString()
  @IsNotEmpty()
  nativeName: string;

  @ApiProperty({
    example: '🇺🇸',
    description: 'Language icon symbol',
  })
  @IsString()
  @IsNotEmpty()
  iconSymbol: string;

  @ApiProperty({
    example: true,
    description: 'Is support Google TTS female voice',
  })
  @IsBoolean()
  @IsNotEmpty()
  isSupportGoogleTtsVoiceFemaleGender: boolean;

  @ApiProperty({
    example: false,
    description: 'Is support Google TTS male voice',
  })
  @IsBoolean()
  @IsNotEmpty()
  isSupportGoogleTtsVoiceMaleGender: boolean;
}
