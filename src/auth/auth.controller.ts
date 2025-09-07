import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { ValidateResponse } from '../common/decorators/validate-response.decorator';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  CurrentUser,
  type ICurrentUser,
} from './decorators/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { LocalUser } from './strategies/local.strategy';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'Authenticates user and returns access token',
    type: JwtTokenDto,
  })
  @ValidateResponse(JwtTokenDto)
  login(
    @Body() loginDto: LoginDto,
    @Request() req: { user: LocalUser },
  ): JwtTokenDto {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiOkResponse({
    description: 'Registers user and returns access token',
    type: JwtTokenDto,
  })
  @ValidateResponse(JwtTokenDto)
  register(@Body() registerDto: RegisterDto): Promise<JwtTokenDto> {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({
    description: 'Logs out user and returns access token',
    type: LogoutResponseDto,
  })
  @ValidateResponse(LogoutResponseDto)
  logout(@CurrentUser() user: ICurrentUser): Promise<LogoutResponseDto> {
    return this.authService.logout(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Refresh access token',
    type: RefreshResponseDto,
  })
  @ValidateResponse(RefreshResponseDto)
  refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiOkResponse({
    description: 'Returns current user info',
    type: UserDto,
  })
  @ValidateResponse(UserDto)
  async me(@CurrentUser() user: ICurrentUser): Promise<UserDto> {
    return this.authService.me(user.id);
  }
}
