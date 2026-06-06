import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 获取配置服务
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  // 使用Winston日志
  app.useLogger(logger);

  // 安全中间件
  app.use(helmet());

  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', 'http://localhost:4200').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  });

  // API版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters();

  // Swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('纺织面料ERP系统 API')
    .setDescription('企业级针织面料行业ERP系统接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证授权')
    .addTag('system', '系统管理')
    .addTag('base-data', '基础数据')
    .addTag('sales', '销售管理')
    .addTag('purchase', '采购管理')
    .addTag('inventory', '库存管理')
    .addTag('finance', '财务管理')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 启动应用
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`应用已启动，监听端口: ${port}`, 'Bootstrap');
  logger.log(`API文档地址: http://localhost:${port}/api/docs`, 'Swagger');
}

bootstrap();
