import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Folder name',
    description: 'Folder name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
