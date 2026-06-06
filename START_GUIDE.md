# 纺织面料 ERP 系统 - 快速启动指南

## 1. 系统要求

- Node.js 20.x 或更高版本
- Docker 和 Docker Compose
- npm 9.x 或更高版本

## 2. 启动基础设施服务

### 2.1 启动 Docker 容器

```bash
cd infra/docker
docker-compose up -d
```

这会启动以下服务：
- PostgreSQL 15 (端口: 5432)
- Redis 7 (端口: 6379)
- Prometheus (端口: 9090)
- Grafana (端口: 3001, 默认账号: admin/admin123)
- Elasticsearch (端口: 9200)
- Kibana (端口: 5601)
- Logstash (端口: 5000)

### 2.2 检查服务状态

```bash
docker-compose ps
```

确保所有容器状态都是 "Up"

## 3. 启动后端服务

### 3.1 安装依赖

```bash
cd backend
npm install
```

### 3.2 启动开发服务器

```bash
npm run start:dev
```

后端服务会在 `http://localhost:3000` 启动

### 3.3 访问 API 文档

Swagger 文档: `http://localhost:3000/api`

## 4. 启动前端服务

### 4.1 安装依赖

```bash
cd frontend
npm install
```

### 4.2 启动开发服务器

```bash
npm start
```

前端应用会在 `http://localhost:4200` 启动

## 5. 已完成的模块

### 5.1 后端模块

- ✅ 用户认证和授权 (AuthModule)
- ✅ 系统管理 (SystemModule) - 用户、角色、权限
- ✅ 基础数据 (BaseDataModule) - 产品、客户、供应商、仓库
- ✅ 占位模块 - 颜色配方、花型、批次、库存、销售订单

### 5.2 前端模块

- ✅ 基础项目结构
- ✅ 认证服务和路由守卫
- ✅ HTTP 拦截器 (认证、错误处理)

## 6. 开发配置

### 6.1 后端配置

环境配置文件: `backend/.env` 和 `infra/docker/.env`

主要配置项:
- 数据库连接信息
- Redis 连接信息
- JWT 密钥配置
- 日志配置

### 6.2 前端配置

环境配置文件: `frontend/src/environments/environment.ts` (开发) 和 `environment.prod.ts` (生产)

## 7. 停止服务

### 7.1 停止后端和前端

在对应的终端按 `Ctrl + C`

### 7.2 停止 Docker 容器

```bash
cd infra/docker
docker-compose down
```

### 7.3 停止并删除数据（谨慎使用）

```bash
cd infra/docker
docker-compose down -v
```

## 8. 下一步开发

根据需求规格说明书，下一步需要开发：
- 完整的产品管理功能
- 完整的客户管理功能
- 完整的供应商管理功能
- 完整的仓库管理功能
- 颜色配方管理
- 花型管理
- 批次管理
- 库存管理
- 销售订单管理
- 采购订单管理
- 成本核算
- 报表系统

## 9. 问题排查

### 9.1 数据库连接失败

检查:
1. Docker 容器是否正常运行
2. 环境变量配置是否正确
3. 端口 5432 是否被占用

### 9.2 依赖安装失败

尝试:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 9.3 查看服务日志

```bash
cd infra/docker
docker-compose logs -f postgres
docker-compose logs -f redis
```
