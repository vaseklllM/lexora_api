import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetLanguageDto {
  @ApiProperty({
    example: 'en-US',
    description: 'Language code',
  })
  @IsString()
  @IsNotEmpty()
  languageCode: string;
}
