import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { JwtPayload } from 'src/auth/decorators/current-user.decorator';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  private getRedisLogoutKey(jwtId: string): string {
    return `jwt:${jwtId}:logout`;
  }

  private getRedisRefreshKey(jwtId: string): string {
    return `jwt:${jwtId}:refresh`;
  }

  private async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      this.logger.log(`Set key: ${key} with TTL: ${ttl || 'no expiration'}`);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  private async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async setJwtLogout(jwtPayload: JwtPayload) {
    await this.set(
      this.getRedisLogoutKey(jwtPayload.jwtId),
      jwtPayload.sub,
      jwtPayload.exp! - Math.floor(Date.now() / 1000),
    );
  }

  async getJwtLogout(jwtId: string) {
    return await this.get(this.getRedisLogoutKey(jwtId));
  }

  async setJwtRefresh(jwtPayload: JwtPayload) {
    await this.set(
      this.getRedisRefreshKey(jwtPayload.jwtId),
      jwtPayload.sub,
      jwtPayload.exp! - Math.floor(Date.now() / 1000),
    );
  }

  async getJwtRefresh(jwtId: string) {
    return await this.get(this.getRedisRefreshKey(jwtId));
  }
}
