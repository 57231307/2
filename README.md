# 纺织面料ERP系统

&gt; 企业级针织面料行业全功能ERP系统

## 项目简介

本系统是一款专为针织面料行业设计的企业资源计划（ERP）管理系统，支持：

- **基础数据管理**：物料、产品、客户、供应商主数据
- **销售管理**：销售订单、报价、合同管理
- **采购管理**：采购订单、供应商协同
- **库存管理**：入库、出库、盘点、库位管理
- **财务管理**：应收、应付、凭证管理
- **生产管理**：生产计划、工单、质量控制
- **面料特色**：染色配方、花型版权、面料检测

## 技术栈

### 前端
- Angular 22+
- SignalForms
- OnPush变更检测
- NgRx状态管理
- Tailwind CSS

### 后端
- NestJS 10+
- TypeORM
- PostgreSQL 16+
- Redis 7+
- JWT认证
- 事件驱动架构

## 项目结构

```
fabric-erp/
├── frontend/     # 前端项目
├── backend/      # 后端项目
├── infra/        # 基础设施
└── docs/         # 项目文档
```

## 快速开始

### 前置要求
- Node.js 20+
- Docker Desktop
- PostgreSQL 16+
- Redis 7+

### 启动开发环境

```bash
# 1. 克隆项目
git clone https://gitlab.example.com/fabric-erp/fabric-erp.git
cd fabric-erp

# 2. 启动基础设施
cd infra/docker
docker-compose up -d

# 3. 启动后端
cd backend
npm install
npm run start:dev

# 4. 启动前端
cd frontend
npm install
npm run start
```

### 环境变量配置

#### 后端环境变量 (.env)

```env
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fabric_erp
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=fabric_erp_dev

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# CORS配置
CORS_ORIGINS=http://localhost:4200

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 日志
LOG_LEVEL=debug
LOG_DIR=./logs
```

## 开发规范

### Git提交规范

使用Conventional Commits格式：

```
&lt;type&gt;(&lt;scope&gt;): &lt;subject&gt;

# 示例
feat(base-data): 添加产品分类管理
fix(sales): 修复订单状态更新问题
docs(api): 更新销售订单API文档
test(inventory): 添加库存盘点单元测试
```

### 代码规范

- 前端：遵循Angular风格指南
- 后端：遵循NestJS最佳实践
- 命名：使用有意义的描述性名称
- 注释：解释"为什么"，不解释"做什么"

## 测试

### 运行测试

```bash
# 后端测试
cd backend
npm run test

# 前端测试
cd frontend
npm run test

# E2E测试
npm run test:e2e
```

### 测试覆盖率要求

- 单元测试覆盖率：≥80%
- 分支覆盖率：≥70%

## 部署

### Docker部署

```bash
cd infra/docker
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes部署

```bash
cd infra/kubernetes
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

## 监控

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Kibana: http://localhost:5601

## 文档

- [技术架构文档](docs/specs/01-技术架构细节.md)
- [数据库设计文档](docs/specs/02-数据库详细设计.md)
- [API接口文档](docs/specs/03-API接口设计.md)
- [核心业务流程](docs/specs/04-核心业务流程.md)
- [开发规范](docs/specs/05-开发流程与规范.md)
- [测试策略](docs/specs/06-测试策略.md)
- [安全方案](docs/specs/07-安全方案.md)
- [运维监控](docs/specs/08-运维与监控.md)

## 团队

- 项目经理：待定
- 技术负责人：待定
- 开发团队：18人

## 许可证

Proprietary - All Rights Reserved
