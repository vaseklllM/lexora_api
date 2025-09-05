import { ConflictException, Injectable } from '@nestjs/common';
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
  constructor(private readonly databaseService: DatabaseService) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const res = await this.databaseService.user.findMany();

    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' + loginDto.email,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      user: {
        id: res[0].id,
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        avatar: 'https://example.com/avatar.jpg',
      },
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
      secret: Buffer.from(process.env.PASSWORD_SECRET_KEY as string, 'utf-8'),
    });

    const res = await this.databaseService.user.create({
      data: {
        email: registerDto.email,
        password: hash,
        name: registerDto.name,
      },
    });

    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' + registerDto.email,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      user: {
        id: res.id,
        email: res.email,
        name: res.name,
        createdAt: res.createdAt.toISOString(),
        updatedAt: res.updatedAt.toISOString(),
        avatar: 'https://example.com/avatar.jpg',
      },
    };
  }

  logout(): LogoutResponseDto {
    return {
      message: 'Successfully logged out',
      loggedOutAt: '2023-01-01T00:00:00Z',
    };
  }

  refresh(refreshDto: RefreshDto): RefreshResponseDto {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_' + refreshDto.refreshToken,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
    };
  }

  me(): UserDto {
    return {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      avatar: 'https://example.com/avatar.jpg',
    };
  }
}
