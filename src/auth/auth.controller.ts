import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ValidateResponse } from '../common/decorators/validate-response.decorator';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

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
    type: RegisterResponseDto,
  })
  @ValidateResponse(RegisterResponseDto)
  register(@Body() registerDto: RegisterDto): RegisterResponseDto {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({
    description: 'Logs out user and returns access token',
    type: LogoutResponseDto,
  })
  @ValidateResponse(LogoutResponseDto)
  logout(): LogoutResponseDto {
    return this.authService.logout();
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Refresh access token',
    type: RefreshResponseDto,
  })
  @ValidateResponse(RefreshResponseDto)
  refresh(@Body() refreshDto: RefreshDto): RefreshResponseDto {
    return this.authService.refresh(refreshDto);
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
