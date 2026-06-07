import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库配置
 * 配置PostgreSQL连接参数
 */
export function databaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_DATABASE', 'fabric_erp'),
    // extra 配置（包含时区）
    extra: {
      max: configService.get<number>('DB_POOL_MAX', 20),
      min: configService.get<number>('DB_POOL_MIN', 5),
      options: '-c timezone=Asia/Shanghai',
    },
    // 自动同步（生产环境应关闭）
    synchronize: configService.get('NODE_ENV') !== 'production',
    // 日志配置
    logging: configService.get('NODE_ENV') !== 'production',
    // 实体路径（根据项目结构配置）
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  };
}
