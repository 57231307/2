export const configuration = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,

    // 数据库配置
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'fabric_erp',
      password: process.env.DATABASE_PASSWORD || 'password',
      name: process.env.DATABASE_NAME || 'fabric_erp_dev',
    },

    // Redis配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB, 10) || 0,
    },

    // JWT配置
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // CORS配置
    cors: {
      origins: process.env.CORS_ORIGINS || 'http://localhost:4200',
    },

    // 文件上传配置
    upload: {
      dir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
      maxFiles: parseInt(process.env.MAX_FILES, 10) || 10,
    },

    // 日志配置
    log: {
      level: process.env.LOG_LEVEL || 'debug',
      dir: process.env.LOG_DIR || './logs',
    },

    // 限流配置
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
  };
};
