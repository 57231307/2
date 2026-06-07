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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/tmp/fabric-erp-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "  纺织面料ERP系统 - 数据库备份脚本"
echo "=========================================="

# 检查 Docker 是否运行
if ! docker ps &> /dev/null; then
    log_error "Docker 服务未运行"
    exit 1
fi

# 检查数据库容器是否存在
if ! docker ps --format '{{.Names}}' | grep -q "fabric-erp-db"; then
    log_error "数据库容器未运行"
    exit 1
fi

log_info "开始备份数据库..."

# 备份数据库
BACKUP_FILE="$BACKUP_DIR/fabric_erp_backup_${TIMESTAMP}.sql"

docker exec fabric-erp-db pg_dump -U postgres -d fabric_erp -F p -f "/tmp/backup_${TIMESTAMP}.sql"

# 复制备份文件到宿主机
docker cp "fabric-erp-db:/tmp/backup_${TIMESTAMP}.sql" "$BACKUP_FILE"

# 清理容器内的临时文件
docker exec fabric-erp-db rm -f "/tmp/backup_${TIMESTAMP}.sql"

# 压缩备份文件
log_info "压缩备份文件..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# 备份 Redis 数据
log_info "备份 Redis 数据..."
REDIS_BACKUP_FILE="$BACKUP_DIR/fabric_erp_redis_${TIMESTAMP}.rdb"
docker cp "fabric-erp-redis:/data/dump.rdb" "$REDIS_BACKUP_FILE" 2>/dev/null || {
    log_warning "Redis 备份文件不存在或备份失败"
}

# 清理旧备份（保留最近 7 天）
log_info "清理旧备份文件..."
find "$BACKUP_DIR" -name "fabric_erp_*" -mtime +7 -delete 2>/dev/null || true

log_success "备份完成！"
echo ""
echo "备份文件："
echo "  - 数据库: $BACKUP_FILE"
[ -f "$REDIS_BACKUP_FILE" ] && echo "  - Redis: $REDIS_BACKUP_FILE"
echo ""
echo "备份目录: $BACKUP_DIR"
echo "备份时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 显示备份文件大小
du -h "$BACKUP_FILE" 2>/dev/null || true
