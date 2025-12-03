-- 更新资金状态枚举值的脚本

-- 首先更新现有数据
UPDATE funds 
SET status = CASE 
    WHEN status = 'active' THEN 'using' 
    WHEN status = 'planned' THEN 'unused' 
    WHEN status = 'used' THEN 'used' 
    WHEN status = 'expired' THEN 'expired' 
    ELSE 'unused' 
END;

-- 然后修改表结构
ALTER TABLE funds MODIFY COLUMN status ENUM('unused', 'using', 'used', 'expired') NOT NULL DEFAULT 'unused';