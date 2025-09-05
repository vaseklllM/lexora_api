import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenDto } from './dto/jwt-tocken.dto';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { DatabaseService } from 'src/database/database.service';
import * as argon2 from 'argon2';
import { LocalUser } from './strategies/local.strategy';
import type { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens(user: Pick<User, 'id' | 'email'>): JwtTokenDto {
    const payload = { sub: user.id, email: user.email };

    return {
      token: this.jwtService.sign(payload, {
        secret: Buffer.from(process.env.JWT_SECRET as string, 'utf-8'),
        expiresIn: '1h',
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: Buffer.from(process.env.JWT_REFRESH_SECRET as string, 'utf-8'),
      }),
      expiresIn: 3600,
    };
  }

  login(user: LocalUser): JwtTokenDto {
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<JwtTokenDto> {
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

    return this.generateTokens(res);
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
