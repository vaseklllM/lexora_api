import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UserDto, userExample } from './user.dto';
import { Type } from 'class-transformer';
import { JwtTokenDto } from './jwt-token.dto';

export class RegisterResponseDto extends JwtTokenDto {
  @ApiProperty({
    example: userExample,
    description: 'User',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}
