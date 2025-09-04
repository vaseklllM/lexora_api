import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto): LoginResponseDto {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' + loginDto.email,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        avatar: 'https://example.com/avatar.jpg',
      },
    };
  }

  register(registerDto: RegisterDto): RegisterResponseDto {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' + registerDto.email,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
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
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      avatar: 'https://example.com/avatar.jpg',
    };
  }
}
