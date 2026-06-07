# 多阶段构建：依赖安装 -> 构建 -> 运行
FROM node:18-alpine AS dependencies

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖配置文件
COPY package*.json ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 从依赖阶段复制 node_modules
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# 安装 pnpm 并构建
RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 设置用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# 使用 dumb-init 引导进程
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
