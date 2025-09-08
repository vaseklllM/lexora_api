import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LanguageDto {
  @ApiProperty({
    example: 'en',
    description: 'Language code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
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
}
