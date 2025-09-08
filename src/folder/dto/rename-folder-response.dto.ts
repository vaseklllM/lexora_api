import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameFolderResponseDto {
  @ApiProperty({
    example: 'Folder renamed successfully',
    description: 'Folder renamed message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
