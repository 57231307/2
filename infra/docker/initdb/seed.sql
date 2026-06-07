-- 面料ERP系统基础数据初始化脚本

\c fabric_erp

-- 初始化系统字典数据
CREATE TABLE IF NOT EXISTS sys_dict (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dict_name VARCHAR(100) NOT NULL,
    dict_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_dict_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dict_id UUID REFERENCES sys_dict(id) ON DELETE CASCADE,
    dict_label VARCHAR(100) NOT NULL,
    dict_value VARCHAR(100) NOT NULL,
    dict_sort INTEGER DEFAULT 0,
    dict_status INTEGER DEFAULT 1,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 客户类型字典
INSERT INTO sys_dict (dict_name, dict_code, description, sort_order) VALUES
    ('客户类型', 'customer_type', '客户类型分类', 1)
ON CONFLICT (dict_code) DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '终端客户', 'END_CUSTOMER', 1 FROM sys_dict WHERE dict_code = 'customer_type'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '批发商', 'WHOLESALER', 2 FROM sys_dict WHERE dict_code = 'customer_type'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '经销商', 'DISTRIBUTOR', 3 FROM sys_dict WHERE dict_code = 'customer_type'
ON CONFLICT DO NOTHING;

-- 供应商类型字典
INSERT INTO sys_dict (dict_name, dict_code, description, sort_order) VALUES
    ('供应商类型', 'supplier_type', '供应商类型分类', 2)
ON CONFLICT (dict_code) DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '面料供应商', 'FABRIC_SUPPLIER', 1 FROM sys_dict WHERE dict_code = 'supplier_type'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '辅料供应商', 'ACCESSORY_SUPPLIER', 2 FROM sys_dict WHERE dict_code = 'supplier_type'
ON CONFLICT DO NOTHING;

-- 产品颜色字典
INSERT INTO sys_dict (dict_name, dict_code, description, sort_order) VALUES
    ('产品颜色', 'product_color', '产品颜色选项', 3)
ON CONFLICT (dict_code) DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '红色', 'RED', 1 FROM sys_dict WHERE dict_code = 'product_color'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '蓝色', 'BLUE', 2 FROM sys_dict WHERE dict_code = 'product_color'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '白色', 'WHITE', 3 FROM sys_dict WHERE dict_code = 'product_color'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '黑色', 'BLACK', 4 FROM sys_dict WHERE dict_code = 'product_color'
ON CONFLICT DO NOTHING;

-- 仓库状态字典
INSERT INTO sys_dict (dict_name, dict_code, description, sort_order) VALUES
    ('仓库状态', 'warehouse_status', '仓库状态', 4)
ON CONFLICT (dict_code) DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '正常', 'NORMAL', 1 FROM sys_dict WHERE dict_code = 'warehouse_status'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '盘点中', 'CHECKING', 2 FROM sys_dict WHERE dict_code = 'warehouse_status'
ON CONFLICT DO NOTHING;

-- 批次状态字典
INSERT INTO sys_dict (dict_name, dict_code, description, sort_order) VALUES
    ('批次状态', 'batch_status', '批次状态', 5)
ON CONFLICT (dict_code) DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '在库', 'IN_STOCK', 1 FROM sys_dict WHERE dict_code = 'batch_status'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '已锁定', 'LOCKED', 2 FROM sys_dict WHERE dict_code = 'batch_status'
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_id, dict_label, dict_value, dict_sort)
SELECT id, '已出库', 'SHIPPED', 3 FROM sys_dict WHERE dict_code = 'batch_status'
ON CONFLICT DO NOTHING;

-- 创建默认管理员用户 (密码: admin123，使用bcrypt加密)
INSERT INTO sys_user (username, password, nickname, email, phone, status, is_superuser)
VALUES ('admin', '$2a$10$Nv4wdbdTAHPfI/5a5r3I4.YQz8WqX9zQ9m3gJz5L8rQFj1qU9wVHy', '系统管理员', 'admin@fabric-erp.com', '13800138000', 1, true)
ON CONFLICT (username) DO NOTHING;
