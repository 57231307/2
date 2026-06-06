import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { configuration } from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SystemModule } from './modules/system/system.module';
import { BaseDataModule } from './modules/base-data/base-data.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local', '../infra/docker/.env'],
    }),

    // 日志模块
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.File({
            filename: configService.get('LOG_DIR', './logs') + '/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            filename: configService.get('LOG_DIR', './logs') + '/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'fabric_erp'),
        password: configService.get('POSTGRES_PASSWORD', 'fabric_erp_password'),
        database: configService.get('POSTGRES_DB', 'fabric_erp_dev'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
        poolSize: 20,
        extra: {
          max: 20,
          min: 5,
        },
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL', 60000),
        limit: configService.get('THROTTLE_LIMIT', 100),
      }),
      inject: [ConfigService],
    }),

    // 事件驱动模块
    EventEmitterModule.forRoot(),

    // 核心模块
    DatabaseModule,
    AuthModule,
    SystemModule,
    BaseDataModule,
  ],
})
export class AppModule {}
