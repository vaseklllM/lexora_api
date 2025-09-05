import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ValidateResponse } from '../common/decorators/validate-response.decorator';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtGuard } from './guards/jwt.guard';
import {
  CurrentUser,
  type JwtPayload,
} from './decorators/current-user.decorator';

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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiOkResponse({
    description: 'Registers user and returns access token',
    type: RegisterResponseDto,
  })
  @ValidateResponse(RegisterResponseDto)
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
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
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiOkResponse({
    description: 'Returns current user info',
    type: UserDto,
  })
  @ValidateResponse(UserDto)
  async me(@CurrentUser() user: JwtPayload): Promise<UserDto> {
    return this.authService.me(user.sub);
  }
}
