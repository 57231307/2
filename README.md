# 纺织面料ERP系统

> 企业级面料行业ERP系统，支持高准确性、高性能、数据唯一性

---

## 项目概述

本项目是一个完整的纺织面料行业企业级ERP系统，包含以下核心功能：
- 基础数据管理（产品、客户、供应商、仓库）
- 销售管理（订单、报价、审批流程）
- 采购管理
- 库存管理（严格批次、循环盘点）
- 生产管理
- 颜色配方和花型管理
- 财务成本核算
- 系统管理（用户、角色、权限）

---

## 技术栈

### 前端
- Angular 22
- NgRx 状态管理
- Tailwind CSS
- Signal 响应式

### 后端
- NestJS 10
- TypeORM
- PostgreSQL
- Redis
- JWT 认证
- Winston 日志

### 基础设施
- Docker & Docker Compose
- Prometheus + Grafana (监控)
- Elasticsearch + Kibana (日志)

---

## 项目结构

```
/workspace
├── backend/              # NestJS 后端
├── frontend/             # Angular 前端
├── infra/                # 基础设施
│   └── docker/          # Docker 配置
├── docs/                # 文档目录
├── .eslintrc.js        # ESLint 配置
├── .prettierrc         # Prettier 配置
├── .gitignore          # Git 忽略配置
└── README.md           # 本文档
```

---

## 快速开始

详细的启动指南请参考 [快速启动指南](docs/START_GUIDE.md)

### 启动基础设施
```bash
cd infra/docker
docker-compose up -d
```

### 启动后端
```bash
cd backend
npm install
npm run start:dev
```

### 启动前端
```bash
cd frontend
npm install
npm start
```

---

## 文档

完整的项目文档位于 [docs/](docs/) 目录：

- [需求规格说明书](docs/specs/需求规格说明书.md)
- [技术实施方案](docs/specs/技术实施方案.md)
- [数据库详细设计](docs/specs/02-数据库详细设计.md)
- [API 接口设计](docs/specs/03-API接口设计.md)
- [开发环境指南](docs/DEVELOPMENT.md)
- [开发进度总结](docs/DEVELOPMENT_PROGRESS.md)

---

## 开发规范

- 所有代码使用中文注释
- 遵循 ESLint 和 Prettier 规范
- 使用 Conventional Commits 提交规范
- 所有 API 提供 Swagger 文档

---

## License

UNLICENSED
