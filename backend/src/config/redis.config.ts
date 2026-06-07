import { ConfigService } from '@nestjs/config';

/**
 * Redis配置
 * 配置Redis连接参数
 */
export function redisConfig(configService: ConfigService): any {
  return {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD', undefined),
    db: configService.get<number>('REDIS_DB', 0),
    // 连接池配置
    maxRetriesPerRequest: 3,
    // 键前缀
    keyPrefix: configService.get('REDIS_KEY_PREFIX', 'fabric_erp:'),
  };
}
