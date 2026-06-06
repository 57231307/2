import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'localhost'),
  port: configService.get('POSTGRES_PORT', 5432),
  username: configService.get('POSTGRES_USER', 'fabric_erp'),
  password: configService.get('POSTGRES_PASSWORD', 'fabric_erp_password'),
  database: configService.get('POSTGRES_DB', 'fabric_erp_dev'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/core/database/migrations/*{.ts,.js}'],
  subscribers: ['dist/**/*.subscriber{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
});
