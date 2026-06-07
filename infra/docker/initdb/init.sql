-- 面料ERP系统数据库初始化脚本

-- 创建应用数据库用户
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fabric_erp') THEN
        CREATE USER fabric_erp WITH PASSWORD 'fabric_erp_password';
    END IF;
END
$$;

-- 创建数据库（如果不存在）
SELECT 'CREATE DATABASE fabric_erp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fabric_erp')\gexec

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE fabric_erp TO fabric_erp;

-- 连接到 fabric_erp 数据库执行以下操作
\c fabric_erp

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type VARCHAR(50) DEFAULT 'string',
    config_group VARCHAR(50) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统操作日志表
CREATE TABLE IF NOT EXISTS sys_oper_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    username VARCHAR(100),
    operation VARCHAR(100),
    method VARCHAR(200),
    request_url TEXT,
    request_method VARCHAR(20),
    request_params JSONB,
    request_body JSONB,
    response_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    execution_time INTEGER,
    status INTEGER DEFAULT 1,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oper_log_user_id ON sys_oper_log(user_id);
CREATE INDEX IF NOT EXISTS idx_oper_log_created_at ON sys_oper_log(created_at);
CREATE INDEX IF NOT EXISTS idx_config_key ON sys_config(config_key);

-- 插入默认配置数据
INSERT INTO sys_config (config_key, config_value, config_type, config_group, description) VALUES
    ('system.name', '纺织面料ERP系统', 'string', 'general', '系统名称'),
    ('system.version', '1.0.0', 'string', 'general', '系统版本'),
    ('system.allow_register', 'false', 'boolean', 'security', '是否允许新用户注册'),
    ('jwt.expire', '604800', 'number', 'security', 'JWT过期时间(秒)，默认7天'),
    ('upload.max_size', '10485760', 'number', 'upload', '文件上传最大大小(字节)，默认10MB'),
    ('upload.allowed_types', 'image/jpeg,image/png,image/gif,application/pdf', 'string', 'upload', '允许上传的文件类型')
ON CONFLICT (config_key) DO NOTHING;

-- 授予表权限给 fabric_erp 用户
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fabric_erp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fabric_erp;
