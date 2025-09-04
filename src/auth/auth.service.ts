import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto): LoginResponseDto {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' + loginDto.email,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
    };
  }

  register(registerDto: RegisterDto) {
    return 'Register: ' + registerDto.email;
  }

  logout() {
    return 'Logout';
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
