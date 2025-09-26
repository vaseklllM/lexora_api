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
import { AccountProvider, AccountType, type User } from '@prisma/client';
import { ICurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import {
  JWT_REFRESH_TOKEN_LIFETIME_DAYS,
  JWT_TOKEN_LIFETIME_MINUTES,
} from 'src/common/config';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { OAuth2Client } from 'google-auth-library';

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
        expiresIn: `${JWT_TOKEN_LIFETIME_MINUTES}m`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${JWT_REFRESH_TOKEN_LIFETIME_DAYS}d`,
        secret: Buffer.from(process.env.JWT_REFRESH_SECRET as string, 'utf-8'),
      }),
      expiresIn: 3600,
    };
  }

  login(user: LocalUser): LoginResponseDto {
    return {
      ...this.generateTokens(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        avatar: user.avatar ?? undefined,
      },
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<LoginResponseDto> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: googleLoginDto.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException('Google account email not available');
    }

    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified');
    }

    if (
      googleLoginDto.email &&
      googleLoginDto.email.toLowerCase() !== payload.email.toLowerCase()
    ) {
      throw new UnauthorizedException('Email mismatch for Google login');
    }

    const user = await this.databaseService.user.findUnique({
      where: { email: payload.email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      const newUser = await this.databaseService.user.create({
        data: {
          email: payload.email,
          name: payload.name!,
          avatar: payload.picture,
          accounts: {
            create: {
              provider: AccountProvider.google,
              type: AccountType.oauth,
              providerAccountId: googleLoginDto.accountId,
            },
          },
        },
      });

      return {
        ...this.generateTokens(newUser),
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
          avatar: newUser.avatar ?? undefined,
        },
      };
    }

    if (!user.accounts.some((i) => i.provider === AccountProvider.google)) {
      await this.databaseService.account.create({
        data: {
          type: AccountType.oauth,
          provider: AccountProvider.google,
          providerAccountId: googleLoginDto.accountId,
          userId: user.id,
        },
      });
    }

    return {
      ...this.generateTokens(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        avatar: user.avatar ?? undefined,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const userCreated = await this.databaseService.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hash = await argon2.hash(registerDto.password, {
        secret: Buffer.from(process.env.PASSWORD_SECRET as string, 'utf-8'),
      });

      const userCreated = await tx.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          accounts: {
            create: {
              provider: AccountProvider.credentials,
              type: AccountType.credentials,
              passwordHash: hash,
            },
          },
        },
      });

      return userCreated;
    });

    return {
      ...this.generateTokens(userCreated),
      user: {
        id: userCreated.id,
        email: userCreated.email,
        name: userCreated.name,
        createdAt: userCreated.createdAt.toISOString(),
        updatedAt: userCreated.updatedAt.toISOString(),
        avatar: userCreated.avatar ?? undefined,
      },
    };
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
