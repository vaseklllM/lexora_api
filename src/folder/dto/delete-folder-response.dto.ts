import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFolderResponseDto {
  @ApiProperty({
    example: 'Folder deleted successfully',
    description: 'Folder deleted message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
