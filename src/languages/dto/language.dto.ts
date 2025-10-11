import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export const languageEnExample: LanguageDto = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  iconSymbol: '🇺🇸',
};

export const languageUkExample: LanguageDto = {
  code: 'uk',
  name: 'Ukrainian',
  nativeName: 'Українська',
  iconSymbol: '🇺🇦',
};

export class LanguageDto {
  @ApiProperty({
    example: 'en-US',
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

  // @ApiProperty({
  //   example: 'uk-UA-Chirp3-HD-Achird',
  //   description: 'Google TTS female voice name',
  // })
  // @IsString()
  // @IsOptional()
  // googleTtsVoiceFemaleName: string[];

  // @ApiProperty({
  //   example: 'uk-UA-Chirp3-HD-Achird',
  //   description: 'Google TTS male voice name',
  // })
  // @IsString()
  // @IsOptional()
  // googleTtsVoiceMaleName: string[];
}
