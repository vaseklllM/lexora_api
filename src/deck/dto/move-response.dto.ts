import { IsNotEmpty, IsString } from 'class-validator';

export class MoveResponseDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
