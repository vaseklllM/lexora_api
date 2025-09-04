import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ValidateResponse } from '../common/decorators/validate-response.decorator';
import { UserDto } from './dto/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'Authenticates user and returns access token',
    type: LoginResponseDto,
  })
  @ValidateResponse(LoginResponseDto)
  login(@Body() loginDto: LoginDto): LoginResponseDto {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiOkResponse({
    description: 'Registers user and returns access token',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({
    description: 'Logs out user and returns access token',
  })
  logout() {
    return this.authService.logout();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiOkResponse({
    description: 'Returns current user info',
    type: UserDto,
  })
  @ValidateResponse(UserDto)
  me(): UserDto {
    return this.authService.me();
  }
}
