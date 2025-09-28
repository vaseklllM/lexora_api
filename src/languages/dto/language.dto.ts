import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const languageEnExample: LanguageDto = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  iconSymbol: '🇺🇸',
  googleTtsVoiceFemaleName: 'uk-UA-Chirp3-HD-Achird',
  googleTtsVoiceMaleName: 'uk-UA-Chirp3-HD-Achird',
};

export const languageUkExample: LanguageDto = {
  code: 'uk',
  name: 'Ukrainian',
  nativeName: 'Українська',
  iconSymbol: '🇺🇦',
  googleTtsVoiceFemaleName: 'uk-UA-Chirp3-HD-Achird',
  googleTtsVoiceMaleName: 'uk-UA-Chirp3-HD-Achird',
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
    example: 'uk-UA-Chirp3-HD-Achird',
    description: 'Google TTS female voice name',
  })
  @IsString()
  @IsOptional()
  googleTtsVoiceFemaleName?: string;

  @ApiProperty({
    example: 'uk-UA-Chirp3-HD-Achird',
    description: 'Google TTS male voice name',
  })
  @IsString()
  @IsOptional()
  googleTtsVoiceMaleName?: string;
}
