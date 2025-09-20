import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { DatabaseService } from 'src/database/database.service';
import * as argon2 from 'argon2';
import { AccountProvider, AccountType, User } from '@prisma/client';

export type LocalUser = Omit<User, 'password'>;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<LocalUser | null> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const account = await this.databaseService.account.findFirst({
      where: {
        userId: user.id,
        provider: AccountProvider.credentials,
        type: AccountType.credentials,
      },
    });

    if (!account || !account.passwordHash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(
      account.passwordHash,
      password,
      {
        secret: Buffer.from(process.env.PASSWORD_SECRET as string, 'utf-8'),
      },
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validate(email: string, password: string): Promise<LocalUser> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
