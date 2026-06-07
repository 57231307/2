# 快速启动指南

## 前置要求

- Node.js >= 18.x
- npm >= 9.x
- Docker 和 Docker Compose (可选，或者本地环境下的推荐使用Docker Compose 快速启动基础设施

## 步骤 1: 启动基础设施

使用 Docker Compose 启动 PostgreSQL 和 Redis：

```bash
cd infra/docker
docker-compose up -d
```

验证服务是否正常：

```bash
docker-compose ps
```

## 步骤 2: 配置后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，根据需要修改配置
npm install
```

## 步骤 3: 启动后端服务

```bash
cd backend
npm run start:dev
```

后端将在 http://localhost:3000 启动，API 文档地址：http://localhost:3000/api/docs

## 项目结构说明

```
/workspace
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   └── entities/
│   │   │       └── base.entity.ts
│   │   ├── modules/
│   │   │   ├── base-data/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── product.entity.ts
│   │   │   │   │   ├── customer.entity.ts
│   │   │   │   │   ├── supplier.entity.ts
│   │   │   │   │   └── warehouse.entity.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── product.service.ts
│   │   │   │   ├── controllers/
│   │   │   │   │   └── product.controller.ts
│   │   │   │   └── base-data.module.ts
│   │   │   └── system/
│   │   │       ├── entities/
│   │   │       │   ├── user.entity.ts
│   │   │       │   ├── role.entity.ts
│   │   │       │   └── permission.entity.ts
│   │   │       ├── services/
│   │   │       │   └── user.service.ts
│   │   │       ├── controllers/
│   │   │       │   └── user.controller.ts
│   │   │       └── system.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── (待创建)
├── infra/
│   └── docker/
│       └── docker-compose.yml
└── docs/
    └── START_GUIDE.md
```

## API 基础使用示例

### 创建产品

```bash
curl -X POST http://localhost:3000/api/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试面料",
    "type": "FABRIC",
    "unit": "米"
  }'
```

### 获取产品列表

```bash
curl http://localhost:3000/api/api/v1/products
```

### 创建用户

```bash
curl -X POST http://localhost:3000/api/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "email": "admin@example.com"
  }'
```
