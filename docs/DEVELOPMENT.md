# 纺织面料ERP系统 - 开发环境启动指南

## 📋 前置要求

确保您的开发环境满足以下要求：

- Node.js 20.x 或更高版本
- npm 9.x 或更高版本
- Docker 和 Docker Compose
- Git (可选，用于版本控制)

## 🚀 快速开始

### 1. 克隆项目（如果需要）

```bash
cd /workspace
```

### 2. 启动基础设施（Docker）

首先启动 PostgreSQL、Redis 和监控服务：

```bash
cd infra/docker
docker-compose up -d
```

这将启动以下服务：
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Prometheus: `localhost:9090`
- Grafana: `localhost:3001` (默认账号: admin/admin123)
- Elasticsearch: `localhost:9200`
- Kibana: `localhost:5601`
- Logstash: `localhost:5000`

### 3. 检查服务状态

```bash
docker-compose ps
```

确保所有服务状态都是 `Up`。

### 4. 安装后端依赖

```bash
cd /workspace/backend
npm install
```

### 5. 启动后端服务

```bash
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动。
Swagger API 文档可在 `http://localhost:3000/api` 访问。

### 6. 安装前端依赖（新终端）

```bash
cd /workspace/frontend
npm install
```

### 7. 启动前端服务

```bash
npm start
```

前端应用将在 `http://localhost:4200` 启动。

## 📝 开发工作流

### Git 分支策略

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交更改
git add .
git commit -m "feat: 你的提交信息"

# 推送到远程
git push origin feature/your-feature-name
```

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Conventional Commits 规范

### 常用命令

#### 后端

```bash
# 开发模式启动
npm run start:dev

# 生产模式构建
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test
npm run test:watch
npm run test:cov
```

#### 前端

```bash
# 开发模式启动
npm start

# 生产模式构建
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test
npm run test:coverage
```

#### Docker

```bash
# 查看服务日志
cd infra/docker
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f

# 停止所有服务
docker-compose down

# 停止并删除数据（谨慎使用）
docker-compose down -v

# 重启服务
docker-compose restart
```

## 🔍 调试指南

### 后端调试

使用 VS Code 或其他支持 Node.js 调试的 IDE：

```bash
# 启动调试模式
npm run start:debug
```

在代码中添加断点，然后在调试器中连接。

### 前端调试

在浏览器开发者工具中进行调试，或使用 Angular DevTools 扩展。

### 数据库调试

连接到 PostgreSQL 数据库：

```bash
# 使用 psql 连接
docker exec -it fabric-erp-postgres psql -U fabric_erp -d fabric_erp_dev
```

或者使用数据库管理工具（如 DBeaver、pgAdmin）连接：
- Host: `localhost`
- Port: `5432`
- Username: `fabric_erp`
- Password: `fabric_erp_password`
- Database: `fabric_erp_dev`

## 📊 监控和日志

### Prometheus

访问 `http://localhost:9090` 查看指标。

### Grafana

访问 `http://localhost:3001` 查看可视化仪表板。
默认账号：`admin` / `admin123`

### Kibana

访问 `http://localhost:5601` 查看应用日志。

## 🛠️ 常见问题

### 1. 端口被占用

如果端口被占用，可以修改 `infra/docker/docker-compose.yml` 或停止占用端口的进程：

```bash
# Linux/Mac
lsof -ti :3000 | xargs kill -9
lsof -ti :4200 | xargs kill -9
lsof -ti :5432 | xargs kill -9
lsof -ti :6379 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

### 2. Docker 服务无法启动

```bash
# 检查 Docker 是否运行
docker info

# 重启 Docker 服务（根据您的系统）
# Linux
sudo systemctl restart docker

# Mac/Windows
# 重启 Docker Desktop 应用
```

### 3. 依赖安装失败

```bash
# 清除缓存重新安装
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### 4. 数据库连接失败

确保 PostgreSQL 容器正在运行，并且 `.env` 中的配置正确：

```bash
# 检查容器状态
cd infra/docker
docker-compose ps

# 查看容器日志
docker-compose logs postgres
```

## 📚 相关文档

- [技术架构细节](./specs/01-技术架构细节.md)
- [API 接口设计](./specs/03-API接口设计.md)
- [开发流程与规范](./specs/05-开发流程与规范.md)
- [测试策略](./specs/06-测试策略.md)
- [安全方案](./specs/07-安全方案.md)
- [运维与监控](./specs/08-运维与监控.md)
- [需求规格说明书](./specs/需求规格说明书.md)

## 🤝 需要帮助？

如有问题，请查看文档或联系开发团队。
