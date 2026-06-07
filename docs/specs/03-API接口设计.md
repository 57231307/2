# 纺织面料ERP系统 - API接口设计

> 版本：V1.0
> 日期：2026年6月7日

---

## 一、API设计规范

### 1.1 基础规范

#### 1.1.1 基础URL
```
开发环境：https://dev-api.fabric-erp.com/api/v1
测试环境：https://test-api.fabric-erp.com/api/v1
生产环境：https://api.fabric-erp.com/api/v1
```

#### 1.1.2 认证方式
所有API请求需要在Header中携带JWT Token：
```
Authorization: Bearer <token>
```

#### 1.1.3 内容类型
```
Content-Type: application/json
Accept: application/json
```

### 1.2 响应格式

#### 1.2.1 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2026-06-07T10:00:00Z"
}
```

#### 1.2.2 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "查询成功",
  "timestamp": "2026-06-07T10:00:00Z"
}
```

#### 1.2.3 错误响应
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "产品不存在",
    "details": {
      "productId": "xxx"
    }
  },
  "timestamp": "2026-06-07T10:00:00Z"
}
```

### 1.3 HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容）|
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期）|
| 403 | 禁止访问（无权限）|
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 验证错误 |
| 500 | 服务器内部错误 |

---

## 二、基础数据模块API

### 2.1 产品管理

#### 2.1.1 创建产品
```
POST /api/v1/products
```

**请求参数：**
```json
{
  "code": "PRD-20260607-0001",
  "name": "纯棉针织面料",
  "type": "FABRIC",
  "spec": "180g/m² 门幅150cm",
  "unit": "meter",
  "colorFormulaId": "uuid",
  "patternId": "uuid",
  "standardCost": 25.50,
  "salePrice": 38.00,
  "images": [],
  "remark": ""
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "PRD-20260607-0001",
    "name": "纯棉针织面料",
    "type": "FABRIC",
    "spec": "180g/m² 门幅150cm",
    "unit": "meter",
    "standardCost": 25.50,
    "salePrice": 38.00,
    "status": "ACTIVE",
    "createdAt": "2026-06-07T10:00:00Z"
  },
  "message": "产品创建成功"
}
```

#### 2.1.2 查询产品列表
```
GET /api/v1/products
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键字 |
| type | string | 否 | 产品类型 |
| status | string | 否 | 产品状态 |
| sortBy | string | 否 | 排序字段 |
| sortOrder | string | 否 | 排序方向 |

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "code": "PRD-20260607-0001",
        "name": "纯棉针织面料",
        "type": "FABRIC",
        "status": "ACTIVE",
        "standardCost": 25.50,
        "salePrice": 38.00
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 2.1.3 获取产品详情
```
GET /api/v1/products/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "PRD-20260607-0001",
    "name": "纯棉针织面料",
    "type": "FABRIC",
    "spec": "180g/m² 门幅150cm",
    "unit": "meter",
    "colorFormula": {
      "id": "uuid",
      "code": "COL-R001",
      "name": "标准红色"
    },
    "pattern": {
      "id": "uuid",
      "code": "PAT-F001",
      "name": "经典格子"
    },
    "standardCost": 25.50,
    "salePrice": 38.00,
    "status": "ACTIVE",
    "images": [],
    "metadata": {},
    "remark": "",
    "createdAt": "2026-06-07T10:00:00Z",
    "updatedAt": "2026-06-07T10:00:00Z"
  }
}
```

#### 2.1.4 更新产品
```
PUT /api/v1/products/:id
```

**请求参数：**
```json
{
  "name": "纯棉针织面料（升级版）",
  "salePrice": 42.00,
  "remark": "价格调整"
}
```

**响应：**
```json
{
  "success": true,
  "data": { ... },
  "message": "产品更新成功"
}
```

#### 2.1.5 删除产品
```
DELETE /api/v1/products/:id
```

**响应：**
```json
{
  "success": true,
  "message": "产品已停用"
}
```

### 2.2 客户管理

#### 2.2.1 创建客户
```
POST /api/v1/customers
```

**请求参数：**
```json
{
  "name": "某某服装有限公司",
  "type": "VIP",
  "contactPerson": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "address": "浙江省杭州市某某区某某路123号",
  "creditLimit": 100000.00,
  "paymentTerms": 30,
  "salespersonId": "user-uuid"
}
```

#### 2.2.2 查询客户列表
```
GET /api/v1/customers
```

#### 2.2.3 获取客户详情
```
GET /api/v1/customers/:id
```

#### 2.2.4 更新客户
```
PUT /api/v1/customers/:id
```

#### 2.2.5 删除客户
```
DELETE /api/v1/customers/:id
```

### 2.3 供应商管理

#### 2.3.1 创建供应商
```
POST /api/v1/suppliers
```

**请求参数：**
```json
{
  "name": "某某染料有限公司",
  "type": "DYE",
  "contactPerson": "李四",
  "phone": "13900139000",
  "email": "lisi@example.com",
  "address": "江苏省某某市某某工业园区",
  "paymentTerms": 45
}
```

#### 2.3.2 查询供应商列表
```
GET /api/v1/suppliers
```

#### 2.3.3 获取供应商详情
```
GET /api/v1/suppliers/:id
```

#### 2.3.4 更新供应商
```
PUT /api/v1/suppliers/:id
```

#### 2.3.5 删除供应商
```
DELETE /api/v1/suppliers/:id
```

### 2.4 仓库管理

#### 2.4.1 创建仓库
```
POST /api/v1/warehouses
```

**请求参数：**
```json
{
  "name": "成品仓库A区",
  "type": "FINISHED",
  "address": "某某工业园区A栋",
  "manager": "王五"
}
```

#### 2.4.2 查询仓库列表
```
GET /api/v1/warehouses
```

#### 2.4.3 获取仓库详情
```
GET /api/v1/warehouses/:id
```

#### 2.4.4 更新仓库
```
PUT /api/v1/warehouses/:id
```

#### 2.4.5 删除仓库
```
DELETE /api/v1/warehouses/:id
```

### 2.5 颜色配方管理 ⭐

#### 2.5.1 创建颜色标准
```
POST /api/v1/color-formulas
```

**请求参数：**
```json
{
  "name": "标准红色",
  "colorNo": "COL-R001",
  "labL": 45.5,
  "labA": 58.2,
  "labB": 25.8,
  "formulas": [
    {
      "dyeName": "活性红",
      "dyeCode": "DY-001",
      "ratio": 2.5,
      "unit": "g/L"
    },
    {
      "dyeName": "活性黄",
      "dyeCode": "DY-002",
      "ratio": 0.5,
      "unit": "g/L"
    }
  ],
  "referenceCost": 5.00
}
```

#### 2.5.2 查询颜色配方列表
```
GET /api/v1/color-formulas
```

#### 2.5.3 获取颜色配方详情
```
GET /api/v1/color-formulas/:id
```

#### 2.5.4 更新颜色配方
```
PUT /api/v1/color-formulas/:id
```

#### 2.5.5 计算配方用量
```
POST /api/v1/color-formulas/:id/calculate
```

**请求参数：**
```json
{
  "targetQuantity": 100,
  "unit": "kg"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "colorFormulaId": "uuid",
    "targetQuantity": 100,
    "unit": "kg",
    "items": [
      {
        "dyeName": "活性红",
        "dyeCode": "DY-001",
        "quantity": 250,
        "unit": "g"
      },
      {
        "dyeName": "活性黄",
        "dyeCode": "DY-002",
        "quantity": 50,
        "unit": "g"
      }
    ],
    "totalCost": 25.00
  }
}
```

### 2.6 花型管理 ⭐

#### 2.6.1 创建花型
```
POST /api/v1/patterns
```

**请求参数：**
```json
{
  "name": "经典格子图案",
  "category": "格子",
  "copyrightNo": "CR-2026-001",
  "copyrightStartDate": "2026-01-01",
  "copyrightEndDate": "2031-12-31",
  "authorizedScope": "内衣、床上用品"
}
```

#### 2.6.2 查询花型列表
```
GET /api/v1/patterns
```

#### 2.6.3 获取花型详情
```
GET /api/v1/patterns/:id
```

#### 2.6.4 更新花型
```
PUT /api/v1/patterns/:id
```

#### 2.6.5 查询版权即将到期花型
```
GET /api/v1/patterns/expiring?days=30
```

---

## 三、销售模块API

### 3.1 销售报价

#### 3.1.1 创建报价
```
POST /api/v1/sale-quotes
```

**请求参数：**
```json
{
  "customerId": "customer-uuid",
  "quoteDate": "2026-06-07",
  "validUntil": "2026-07-07",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 1000,
      "unit": "meter",
      "unitPrice": 38.00,
      "colorFormulaId": "color-uuid",
      "patternId": "pattern-uuid"
    }
  ],
  "taxRate": 13,
  "discountRate": 0,
  "remark": "量大从优"
}
```

#### 3.1.2 报价转订单
```
POST /api/v1/sale-quotes/:id/convert
```

**响应：**
```json
{
  "success": true,
  "data": {
    "quoteId": "uuid",
    "orderId": "uuid",
    "orderNo": "SO-20260607-0001"
  },
  "message": "报价已转为订单"
}
```

### 3.2 销售订单

#### 3.2.1 创建订单
```
POST /api/v1/sales-orders
```

**请求参数：**
```json
{
  "customerId": "customer-uuid",
  "orderDate": "2026-06-07",
  "expectedDeliveryDate": "2026-06-20",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 1000,
      "unit": "meter",
      "unitPrice": 38.00,
      "colorFormulaId": "color-uuid",
      "patternId": "pattern-uuid"
    }
  ],
  "taxRate": 13,
  "discountRate": 0,
  "remark": ""
}
```

#### 3.2.2 订单审批
```
POST /api/v1/sales-orders/:id/approve
```

**请求参数：**
```json
{
  "approved": true,
  "comment": "同意下单"
}
```

#### 3.2.3 订单发货
```
POST /api/v1/sales-orders/:id/deliver
```

**请求参数：**
```json
{
  "items": [
    {
      "orderItemId": "order-item-uuid",
      "batchId": "batch-uuid",
      "quantity": 500
    }
  ],
  "logisticsCompany": "顺丰速运",
  "trackingNo": "SF1234567890"
}
```

### 3.3 发货管理

#### 3.3.1 创建发货单
```
POST /api/v1/delivery-notes
```

#### 3.3.2 查询发货单列表
```
GET /api/v1/delivery-notes
```

#### 3.3.3 获取发货单详情
```
GET /api/v1/delivery-notes/:id
```

#### 3.3.4 确认发货
```
POST /api/v1/delivery-notes/:id/ship
```

### 3.4 销售退货

#### 3.4.1 创建退货单
```
POST /api/v1/sale-returns
```

**请求参数：**
```json
{
  "deliveryNoteId": "delivery-uuid",
  "customerId": "customer-uuid",
  "returnDate": "2026-06-10",
  "reason": "色差过大",
  "items": [
    {
      "deliveryItemId": "delivery-item-uuid",
      "batchId": "batch-uuid",
      "quantity": 50
    }
  ]
}
```

---

## 四、采购模块API

### 4.1 采购订单

#### 4.1.1 创建采购订单
```
POST /api/v1/purchase-orders
```

**请求参数：**
```json
{
  "supplierId": "supplier-uuid",
  "orderDate": "2026-06-07",
  "expectedDate": "2026-06-15",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2000,
      "unit": "meter",
      "unitPrice": 20.00
    }
  ],
  "taxRate": 13,
  "remark": ""
}
```

#### 4.1.2 查询采购订单列表
```
GET /api/v1/purchase-orders
```

#### 4.1.3 获取采购订单详情
```
GET /api/v1/purchase-orders/:id
```

#### 4.1.4 采购订单审批
```
POST /api/v1/purchase-orders/:id/approve
```

### 4.2 采购入库

#### 4.2.1 创建入库单
```
POST /api/v1/goods-receipts
```

**请求参数：**
```json
{
  "orderId": "purchase-order-uuid",
  "supplierId": "supplier-uuid",
  "receiptDate": "2026-06-15",
  "items": [
    {
      "orderItemId": "order-item-uuid",
      "productId": "product-uuid",
      "quantity": 2000,
      "unit": "meter",
      "unitPrice": 20.00,
      "warehouseId": "warehouse-uuid",
      "batchNo": "BAT-20260615-0001"
    }
  ]
}
```

#### 4.2.2 确认入库
```
POST /api/v1/goods-receipts/:id/confirm
```

---

## 五、库存模块API

### 5.1 批次管理 ⭐

#### 5.1.1 查询批次列表
```
GET /api/v1/batches
```

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| productId | UUID | 产品ID |
| warehouseId | UUID | 仓库ID |
| status | string | 批次状态 |
| fromDate | date | 生产日期起 |
| toDate | date | 生产日期止 |

#### 5.1.2 获取批次详情
```
GET /api/v1/batches/:id
```

#### 5.1.3 批次追溯
```
GET /api/v1/batches/:id/trace
```

**响应：**
```json
{
  "success": true,
  "data": {
    "batch": {
      "batchNo": "BAT-20260607-0001",
      "product": { ... },
      "quantity": 1000,
      "productionDate": "2026-06-07",
      "supplier": { ... }
    },
    "inbound": { ... },
    "qualityChecks": [...],
    "outbound": [...],
    "currentStock": 850
  }
}
```

### 5.2 库存查询

#### 5.2.1 查询当前库存
```
GET /api/v1/inventory
```

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "uuid",
        "productCode": "PRD-20260607-0001",
        "productName": "纯棉针织面料",
        "warehouseId": "uuid",
        "warehouseName": "成品仓库A区",
        "totalQuantity": 5000,
        "availableQuantity": 4800,
        "reservedQuantity": 200,
        "unit": "meter"
      }
    ],
    "pagination": { ... }
  }
}
```

#### 5.2.2 查询库存明细
```
GET /api/v1/inventory/detail
```

#### 5.2.3 库存预警设置
```
POST /api/v1/inventory/warnings
```

**请求参数：**
```json
{
  "productId": "product-uuid",
  "warehouseId": "warehouse-uuid",
  "minStock": 100,
  "maxStock": 5000,
  "enableExpiryWarning": true,
  "expiryDays": 30
}
```

### 5.3 库存盘点

#### 5.3.1 创建盘点计划
```
POST /api/v1/inventory-counts
```

**请求参数：**
```json
{
  "countType": "FULL",
  "warehouseId": "warehouse-uuid",
  "planDate": "2026-06-15",
  "items": []
}
```

#### 5.3.2 执行盘点
```
POST /api/v1/inventory-counts/:id/execute
```

**请求参数：**
```json
{
  "items": [
    {
      "itemId": "count-item-uuid",
      "countedQuantity": 4998
    }
  ]
}
```

---

## 六、生产模块API

### 6.1 生产工单

#### 6.1.1 创建工单
```
POST /api/v1/production-orders
```

**请求参数：**
```json
{
  "productId": "product-uuid",
  "quantity": 1000,
  "plannedStartDate": "2026-06-08",
  "plannedEndDate": "2026-06-12",
  "routeId": "route-uuid",
  "priority": 1,
  "remark": ""
}
```

#### 6.1.2 下达工单
```
POST /api/v1/production-orders/:id/release
```

#### 6.1.3 完工汇报
```
POST /api/v1/production-orders/:id/complete
```

**请求参数：**
```json
{
  "completedQuantity": 980,
  "qualifiedQuantity": 950,
  "unqualifiedQuantity": 30,
  "batchNo": "BAT-20260612-0001",
  "warehouseId": "warehouse-uuid"
}
```

### 6.2 领料管理

#### 6.2.1 创建领料单
```
POST /api/v1/material-requisitions
```

**请求参数：**
```json
{
  "productionOrderId": "production-order-uuid",
  "warehouseId": "warehouse-uuid",
  "requisitionDate": "2026-06-08",
  "items": [
    {
      "productId": "material-product-uuid",
      "requestedQuantity": 100,
      "unit": "kg"
    }
  ]
}
```

#### 6.2.2 确认领料
```
POST /api/v1/material-requisitions/:id/issue
```

---

## 七、质量模块API

### 7.1 质检标准

#### 7.1.1 创建质检标准
```
POST /api/v1/quality-standards
```

**请求参数：**
```json
{
  "code": "QS-FABRIC-001",
  "name": "面料成品检验标准",
  "standardType": "FINISHED_PRODUCT",
  "items": [
    {
      "itemName": "外观检验",
      "checkMethod": "目视",
      "standard": "无破洞、无污渍、无色差",
      "aql": 1.0
    },
    {
      "itemName": "色差检测",
      "checkMethod": "仪器",
      "standard": "ΔE≤1.0",
      "aql": 0.65
    },
    {
      "itemName": "缩水率",
      "checkMethod": "测试",
      "standard": "≤5%",
      "aql": 1.0
    }
  ],
  "aqlLevel": 1.0
}
```

### 7.2 质检报告

#### 7.2.1 创建质检报告
```
POST /api/v1/quality-inspections
```

**请求参数：**
```json
{
  "inspectionType": "ARRIVAL",
  "sourceType": "GOODS_RECEIPT",
  "sourceId": "receipt-uuid",
  "sourceNo": "GR-20260615-0001",
  "inspectionDate": "2026-06-15",
  "standardId": "standard-uuid",
  "sampleSize": 80,
  "items": [
    {
      "itemName": "外观检验",
      "checkMethod": "目视",
      "standardValue": "无明显瑕疵",
      "actualValue": "发现3处轻微瑕疵",
      "result": "PASSED"
    },
    {
      "itemName": "色差检测",
      "checkMethod": "仪器",
      "standardValue": "ΔE≤1.0",
      "actualValue": "ΔE=0.8",
      "result": "PASSED"
    }
  ]
}
```

---

## 八、财务模块API

### 8.1 应收款

#### 8.1.1 生成应收单
```
POST /api/v1/accounts-receivable/generate
```

**请求参数：**
```json
{
  "sourceType": "SALES_ORDER",
  "sourceId": "order-uuid",
  "sourceNo": "SO-20260607-0001"
}
```

#### 8.1.2 收款登记
```
POST /api/v1/accounts-receivable/:id/receive
```

**请求参数：**
```json
{
  "amount": 42934.00,
  "receiveDate": "2026-06-20",
  "paymentMethod": "BANK_TRANSFER",
  "bankAccount": "6217****1234",
  "remark": ""
}
```

### 8.2 应付款

#### 8.2.1 生成应付单
```
POST /api/v1/accounts-payable/generate
```

#### 8.2.2 付款登记
```
POST /api/v1/accounts-payable/:id/pay
```

**请求参数：**
```json
{
  "amount": 45200.00,
  "payDate": "2026-06-30",
  "paymentMethod": "BANK_TRANSFER",
  "bankAccount": "6222****5678"
}
```

---

## 九、系统模块API

### 9.1 用户管理

#### 9.1.1 创建用户
```
POST /api/v1/users
```

**请求参数：**
```json
{
  "username": "zhangsan",
  "password": "Zhang123456",
  "email": "zhangsan@example.com",
  "fullName": "张三",
  "phone": "13800138000",
  "departmentId": "department-uuid",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

#### 9.1.2 查询用户列表
```
GET /api/v1/users
```

#### 9.1.3 获取用户详情
```
GET /api/v1/users/:id
```

#### 9.1.4 更新用户
```
PUT /api/v1/users/:id
```

#### 9.1.5 删除用户
```
DELETE /api/v1/users/:id
```

#### 9.1.6 修改密码
```
POST /api/v1/users/:id/change-password
```

**请求参数：**
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

### 9.2 角色权限

#### 9.2.1 创建角色
```
POST /api/v1/roles
```

**请求参数：**
```json
{
  "code": "ADMIN",
  "name": "系统管理员",
  "description": "系统全部权限",
  "permissionIds": ["permission-uuid-1", "permission-uuid-2"]
}
```

#### 9.2.2 查询角色列表
```
GET /api/v1/roles
```

#### 9.2.3 分配权限
```
POST /api/v1/roles/:id/permissions
```

**请求参数：**
```json
{
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```

### 9.3 认证

#### 9.3.1 登录
```
POST /api/v1/auth/login
```

**请求参数：**
```json
{
  "username": "admin",
  "password": "Admin123456"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "user": {
      "id": "uuid",
      "username": "admin",
      "fullName": "系统管理员",
      "email": "admin@example.com",
      "roles": [...]
    }
  }
}
```

#### 9.3.2 刷新Token
```
POST /api/v1/auth/refresh
```

**请求参数：**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 9.3.3 登出
```
POST /api/v1/auth/logout
```

---

## 十、公共API

### 10.1 数据字典

#### 10.1.1 获取枚举值
```
GET /api/v1/enums
```

**查询参数：**
| 参数 | 说明 |
|------|------|
| type | 枚举类型（productType, customerType等）|

**响应：**
```json
{
  "success": true,
  "data": {
    "productType": [
      { "value": "FABRIC", "label": "面料" },
      { "value": "GREIGE_GOODS", "label": "坯布" },
      { "value": "AUXILIARY", "label": "辅料" },
      { "value": "DYE", "label": "染料" },
      { "value": "OTHER", "label": "其他" }
    ],
    "customerType": [
      { "value": "NORMAL", "label": "普通客户" },
      { "value": "VIP", "label": "VIP客户" },
      { "value": "STRATEGIC", "label": "战略客户" }
    ]
  }
}
```

### 10.2 文件上传

#### 10.2.1 上传文件
```
POST /api/v1/uploads
Content-Type: multipart/form-data
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| file | File | 文件 |
| type | string | 文件类型（image/document）|
| module | string | 所属模块 |

**响应：**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "product-image.jpg",
    "fileUrl": "https://cdn.example.com/uploads/xxx.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg"
  }
}
```

### 10.3 编码规则

#### 10.3.1 获取下一个编码
```
GET /api/v1/codes/:type/next
```

**响应：**
```json
{
  "success": true,
  "data": {
    "type": "PRODUCT",
    "code": "PRD-20260607-0001"
  }
}
```

---

## 十一、错误码规范

### 11.1 错误码列表

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| VALIDATION_ERROR | 400 | 请求参数验证错误 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 11.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| PRODUCT_NOT_FOUND | 产品不存在 |
| PRODUCT_CODE_EXISTS | 产品编码已存在 |
| CUSTOMER_NOT_FOUND | 客户不存在 |
| CUSTOMER_CREDIT_EXCEEDED | 客户信用额度不足 |
| SUPPLIER_NOT_FOUND | 供应商不存在 |
| WAREHOUSE_NOT_FOUND | 仓库不存在 |
| INVENTORY_INSUFFICIENT | 库存不足 |
| BATCH_NOT_FOUND | 批次不存在 |
| ORDER_NOT_FOUND | 订单不存在 |
| ORDER_STATUS_ERROR | 订单状态错误 |
| PERMISSION_DENIED | 权限不足 |
| DUPLICATE_OPERATION | 重复操作 |

---

**编制人**：AI助手
**审核人**：[待审核]
**批准人**：[待批准]
**日期**：2026年6月7日
