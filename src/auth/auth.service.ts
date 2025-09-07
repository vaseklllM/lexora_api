import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { UserDto } from './dto/user.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { DatabaseService } from 'src/database/database.service';
import * as argon2 from 'argon2';
import { LocalUser } from './strategies/local.strategy';
import type { User } from 'generated/prisma';
import { ICurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  private generateTokens(user: Pick<User, 'id' | 'email'>): JwtTokenDto {
    const payload: JwtPayload = { sub: user.id, jwtId: uuidv4() };

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

  async logout(currentUser: ICurrentUser): Promise<LogoutResponseDto> {
    const user = await this.databaseService.user.findUnique({
      where: { id: currentUser.id },
    });

    await this.redisService.setJwtLogout({
      sub: currentUser.id,
      jwtId: currentUser.jwt.id,
      exp: currentUser.jwt.exp,
      iat: currentUser.jwt.iat,
    });

    await this.redisService.setJwtRefresh({
      sub: currentUser.id,
      jwtId: currentUser.jwt.id,
      exp: currentUser.jwt.exp,
      iat: currentUser.jwt.iat,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Successfully logged out',
      loggedOutAt: new Date().toISOString(),
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    try {
      const jwtPayload: JwtPayload = await this.jwtService.verify(
        refreshDto.refreshToken,
        {
          secret: Buffer.from(
            process.env.JWT_REFRESH_SECRET as string,
            'utf-8',
          ),
        },
      );

      if (!jwtPayload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const redisUserId = await this.redisService.getJwtRefresh(
        jwtPayload.jwtId,
      );

      if (redisUserId) {
        throw new UnauthorizedException();
      }

      await this.redisService.setJwtLogout(jwtPayload);
      await this.redisService.setJwtRefresh(jwtPayload);

      const user = await this.databaseService.user.findUnique({
        where: { id: jwtPayload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
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
