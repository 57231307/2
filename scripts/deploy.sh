#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../infra/docker" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../backend" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "  纺织面料ERP系统 - Docker部署脚本"
echo "=========================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

cd "$DOCKER_DIR"

# 解析命令行参数
ACTION=${1:-start}

case $ACTION in
    start|up)
        log_info "启动 Docker 服务..."
        
        # 构建前端（如果存在 Angular 项目）
        if [ -d "$PROJECT_ROOT/frontend" ] && [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
            log_info "构建前端项目..."
            cd "$PROJECT_ROOT/frontend"
            if command -v npm &> /dev/null; then
                npm install
                npm run build
                # 复制构建产物到 docker 目录
                if [ -d "dist" ]; then
                    mkdir -p "$DOCKER_DIR/frontend-dist"
                    cp -r dist/* "$DOCKER_DIR/frontend-dist/"
                    log_success "前端构建完成"
                fi
            else
                log_warning "npm 未安装，跳过前端构建"
            fi
            cd "$DOCKER_DIR"
        fi
        
        # 构建后端
        log_info "构建后端服务..."
        if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
            cd "$BACKEND_DIR"
            if command -v pnpm &> /dev/null; then
                pnpm install --frozen-lockfile
                pnpm run build
                log_success "后端构建完成"
            else
                log_warning "pnpm 未安装，使用 npm 替代"
                npm install --frozen-lockfile
                npm run build
                log_success "后端构建完成"
            fi
            cd "$DOCKER_DIR"
        fi
        
        # 创建网络（如果不存在）
        docker network create fabric-erp-network 2>/dev/null || true
        
        # 启动服务
        log_info "启动 Docker Compose 服务..."
        docker-compose up -d --build
        
        # 等待服务健康
        log_info "等待服务启动..."
        sleep 10
        
        # 检查服务状态
        docker-compose ps
        
        log_success "部署完成！"
        echo ""
        echo "服务访问地址："
        echo "  - 前端: http://localhost"
        echo "  - 后端: http://localhost:3000"
        echo "  - API文档: http://localhost/api/docs"
        echo ""
        ;;
        
    stop|down)
        log_info "停止 Docker 服务..."
        docker-compose down
        log_success "服务已停止"
        ;;
        
    restart)
        log_info "重启 Docker 服务..."
        docker-compose restart
        log_success "服务已重启"
        ;;
        
    rebuild)
        log_info "重新构建并启动服务..."
        docker-compose down
        docker-compose up -d --build
        log_success "服务已重新构建并启动"
        ;;
        
    logs)
        log_info "查看服务日志..."
        docker-compose logs -f
        ;;
        
    status)
        log_info "检查服务状态..."
        docker-compose ps
        echo ""
        echo "健康检查状态："
        docker ps --filter "name=fabric-erp" --format "table {{.Names}}\t{{.Status}}"
        ;;
        
    clean)
        log_warning "清理所有容器和数据卷..."
        read -p "确定要删除所有数据吗? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker-compose down -v
            docker network prune -f
            log_success "清理完成"
        else
            log_info "取消清理操作"
        fi
        ;;
        
    backup)
        log_info "备份数据库..."
        "$SCRIPT_DIR/backup.sh"
        ;;
        
    *)
        echo "用法: $0 {start|stop|restart|rebuild|logs|status|clean|backup}"
        echo ""
        echo "  start   - 启动所有服务"
        echo "  stop    - 停止所有服务"
        echo "  restart - 重启所有服务"
        echo "  rebuild - 重新构建并启动"
        echo "  logs    - 查看日志"
        echo "  status  - 查看状态"
        echo "  clean   - 清理容器和数据卷"
        echo "  backup  - 备份数据库"
        exit 1
        ;;
esac
