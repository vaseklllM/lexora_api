import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { DatabaseService } from 'src/database/database.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.databaseService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
      {
        secret: Buffer.from(process.env.PASSWORD_SECRET as string, 'utf-8'),
      },
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: Buffer.from(process.env.JWT_SECRET as string, 'utf-8'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: Buffer.from(process.env.JWT_REFRESH_SECRET as string, 'utf-8'),
    });

    return {
      token: accessToken,
      refreshToken: refreshToken,
      expiresIn: 3600,
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if user with this email already exists
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hash = await argon2.hash(registerDto.password, {
      secret: Buffer.from(process.env.PASSWORD_SECRET as string, 'utf-8'),
    });

    const res = await this.databaseService.user.create({
      data: {
        email: registerDto.email,
        password: hash,
        name: registerDto.name,
      },
    });

    const payload = { sub: res.id, email: res.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: Buffer.from(process.env.JWT_SECRET as string, 'utf-8'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: Buffer.from(process.env.JWT_REFRESH_SECRET as string, 'utf-8'),
    });

    return {
      token: accessToken,
      refreshToken: refreshToken,
      expiresIn: 3600,
    };
  }

  async logout(userId: string): Promise<LogoutResponseDto> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Successfully logged out',
      loggedOutAt: new Date().toISOString(),
    };
  }

  refresh(refreshDto: RefreshDto): RefreshResponseDto {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_' + refreshDto.refreshToken,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
    };
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      avatar: user.avatar ?? undefined,
    };
  }
}
