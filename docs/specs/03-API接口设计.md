# API 接口设计文档

> **版本**：1.0.0  
> **日期**：2025-06-06

---

## 目录
1. [API 设计规范](#1-api-设计规范)
2. [认证与授权](#2-认证与授权)
3. [核心模块 API](#3-核心模块-api)
4. [响应格式](#4-响应格式)
5. [错误处理](#5-错误处理)

---

## 1. API 设计规范

### 1.1 RESTful 规范

```bash
# 版本管理
/api/v1/{resource}

# HTTP 方法语义
GET      # 查询资源
POST     # 创建资源
PUT      # 完整更新资源
PATCH    # 部分更新资源
DELETE   # 删除资源
```

### 1.2 URL 命名规范

```
# 使用名词复数形式
/api/v1/products
/api/v1/customers
/api/v1/sales-orders

# 层级关系
/api/v1/sales-orders/{id}/items
/api/v1/products/{id}/color-formulas
```

---

## 2. 认证与授权

### 2.1 JWT 认证流程

```typescript
// 登录接口
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "password"
}

// 响应
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### 2.2 API 调用示例

```typescript
// 后续请求需要携带 Token
Headers: {
  "Authorization": "Bearer {access_token}"
}
```

---

## 3. 核心模块 API

### 3.1 产品管理 API

```typescript
// 获取产品列表
GET /api/v1/products
Query: {
  page: number;
  pageSize: number;
  categoryId?: string;
  status?: string;
}

// 获取产品详情
GET /api/v1/products/{id}

// 创建产品
POST /api/v1/products
Body: {
  productNo: string;
  name: string;
  categoryId: string;
  composition: string;
  weight: number;
  weightUnit: string;
  width: number;
  widthUnit: string;
}

// 更新产品
PUT /api/v1/products/{id}

// 删除产品
DELETE /api/v1/products/{id}
```

### 3.2 颜色配方 API

```typescript
// 获取产品颜色配方列表
GET /api/v1/products/{productId}/color-formulas

// 创建颜色配方
POST /api/v1/products/{productId}/color-formulas
Body: {
  colorCode: string;
  colorName: string;
  pantoneCode?: string;
  labL: number;
  labA: number;
  labB: number;
  formulaData: Record<string, any>;
}

// 审批颜色配方
POST /api/v1/color-formulas/{id}/approve
```

### 3.3 销售订单 API

```typescript
// 获取销售订单列表
GET /api/v1/sales-orders
Query: {
  page: number;
  pageSize: number;
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// 获取销售订单详情
GET /api/v1/sales-orders/{id}

// 创建销售订单
POST /api/v1/sales-orders
Body: {
  customerId: string;
  customerPoNo?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: [{
    productId: string;
    colorFormulaId?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discountRate?: number;
  }];
  remark?: string;
}

// 更新销售订单状态
PATCH /api/v1/sales-orders/{id}/status
Body: {
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'completed' | 'cancelled';
}

// 取消销售订单
POST /api/v1/sales-orders/{id}/cancel
```

### 3.4 库存管理 API

```typescript
// 获取库存列表
GET /api/v1/inventory
Query: {
  warehouseId?: string;
  productId?: string;
  batchId?: string;
}

// 获取库存流水
GET /api/v1/inventory-transactions
Query: {
  page: number;
  pageSize: number;
  productId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}

// 库存入库
POST /api/v1/inventory/inbound
Body: {
  warehouseId: string;
  locationId?: string;
  items: [{
    productId: string;
    batchId?: string;
    quantity: number;
    unit: string;
  }];
  referenceType: string;
  referenceId?: string;
  referenceNo?: string;
  remark?: string;
}

// 库存出库
POST /api/v1/inventory/outbound
Body: {
  warehouseId: string;
  items: [{
    productId: string;
    batchId?: string;
    quantity: number;
    unit: string;
  }];
  referenceType: string;
  referenceId?: string;
  referenceNo?: string;
  remark?: string;
}

// 库存盘点
POST /api/v1/inventory/take-stock
Body: {
  warehouseId: string;
  items: [{
    productId: string;
    batchId?: string;
    locationId?: string;
    quantity: number;
  }];
  remark?: string;
}
```

### 3.5 生产管理 API

```typescript
// 创建生产工单
POST /api/v1/production-orders
Body: {
  productId: string;
  colorFormulaId?: string;
  quantity: number;
  unit: string;
  plannedStartDate: string;
  plannedEndDate: string;
  workCenterId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  remark?: string;
}

// 获取生产工单详情
GET /api/v1/production-orders/{id}

// 更新生产工单状态
PATCH /api/v1/production-orders/{id}/status
Body: {
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
}

// 生产报工
POST /api/v1/production-orders/{id}/report
Body: {
  processId?: string;
  quantity: number;
  qualifiedQuantity?: number;
  unqualifiedQuantity?: number;
  operatorId?: string;
  remark?: string;
}
```

### 3.6 花型管理 API

```typescript
// 获取花型列表
GET /api/v1/patterns
Query: {
  page: number;
  pageSize: number;
  category?: string;
  style?: string;
  season?: string;
  status?: string;
}

// 获取花型详情
GET /api/v1/patterns/{id}

// 创建花型
POST /api/v1/patterns
Body: {
  patternNo: string;
  name: string;
  category?: string;
  style?: string;
  season?: string;
  theme?: string;
  designerId?: string;
  copyrightOwner?: string;
  designFileUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  description?: string;
}

// 上传花型文件
POST /api/v1/patterns/{id}/files
Content-Type: multipart/form-data
Body: {
  file: File;
  fileType: 'design' | 'thumbnail';
}

// 创建花型版本
POST /api/v1/patterns/{id}/versions
Body: {
  versionNo: string;
  designFileUrl?: string;
  thumbnailUrl?: string;
  changeLog?: string;
}

// 审批花型版本
POST /api/v1/pattern-versions/{id}/approve
```

---

## 4. 响应格式

### 4.1 标准响应

```typescript
// 成功响应
{
  "success": true,
  "data": any,
  "message": "操作成功",
  "timestamp": "2025-06-06T10:00:00Z"
}

// 分页响应
{
  "success": true,
  "data": {
    "list": any[],
    "pagination": {
      "page": number,
      "pageSize": number,
      "total": number,
      "totalPages": number
    }
  },
  "message": "查询成功",
  "timestamp": "2025-06-06T10:00:00Z"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details?: any[]
  },
  "timestamp": "2025-06-06T10:00:00Z"
}
```

---

## 5. 错误处理

### 5.1 错误码定义

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | VALIDATION_ERROR | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证 |
| 403 | FORBIDDEN | 无权限访问 |
| 404 | RESOURCE_NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 资源冲突（如唯一索引重复） |
| 422 | UNPROCESSABLE_ENTITY | 业务规则验证失败 |
| 429 | TOO_MANY_REQUESTS | 请求过于频繁 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |

### 5.2 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": [
      {
        "field": "customerId",
        "message": "客户不能为空"
      },
      {
        "field": "orderDate",
        "message": "订单日期必须小于等于当前日期"
      }
    ]
  },
  "timestamp": "2025-06-06T10:00:00Z"
}
```

---
