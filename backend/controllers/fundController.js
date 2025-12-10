const { db } = require('../config/database');

// 获取所有资金记录
exports.getFunds = (req, res) => {
  db.query(`
      SELECT 
        f.*,
        u.name as recharge_by_name,
        CASE 
          WHEN f.status = 'unused' THEN '未使用'
          WHEN f.status = 'using' THEN '使用中'
          WHEN f.status = 'used' THEN '已用完'
          WHEN f.status = 'expired' THEN '已过期'
          ELSE '未知'
        END as status_text
      FROM funds f
      LEFT JOIN users u ON f.recharge_by = u.id
      ORDER BY f.created_at DESC
    `)
    .then(([results]) => {
      // 添加状态文本映射
      const fundsWithStatusText = results.map(fund => ({
        ...fund,
        statusText: fund.status_text
      }));
      
      res.json({
        code: 200,
        message: '获取资金列表成功',
        data: fundsWithStatusText
      });
    })
    .catch(err => {
      console.error('获取资金列表错误:', err);
      return res.status(500).json({
        code: 500,
        message: '获取资金列表失败'
      });
    });
};

// 根据ID获取资金详情
exports.getFundById = (req, res) => {
  const fundId = req.params.id;
  
  db.query(`
    SELECT 
      f.*,
      u.name as recharge_by_name,
      CASE 
        WHEN f.status = 'unused' THEN '未使用'
        WHEN f.status = 'using' THEN '使用中'
        WHEN f.status = 'used' THEN '已用完'
        WHEN f.status = 'expired' THEN '已过期'
        ELSE '未知'
      END as status_text
    FROM funds f
    LEFT JOIN users u ON f.recharge_by = u.id
    WHERE f.id = ?
  `, [fundId])
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '未找到指定的资金'
        });
      }
      
      // 构造返回数据
      const fund = results[0];
      const fundWithStatusText = {
        ...fund,
        statusText: fund.status_text
      };
      
      res.json({
        code: 200,
        message: '获取资金详情成功',
        data: fundWithStatusText
      });
    })
    .catch(err => {
      console.error('获取资金详情错误:', err);
      return res.status(500).json({
        code: 500,
        message: '获取资金详情失败'
      });
    });
};

// 创建资金
exports.createFund = (req, res) => {
  const { name, platform, position, salaryRange, rechargeByName, amount, date } = req.body;
  
  // 验证必填字段
  if (!name || !platform || !position) {
    return res.status(400).json({
      code: 400,
      message: '资金名称、平台和招聘岗位是必填字段'
    });
  }
  
  const fundData = {
    name,
    platform,
    position,
    salary_range: salaryRange || '',
    recharge_by_name: rechargeByName || '',
    amount: amount || 0,
    date: date || new Date().toISOString().split('T')[0],
    status: 'unused' // 默认状态为未使用
  };
  
  db.query('INSERT INTO funds SET ?', fundData)
    .then(([result]) => {
      const newFund = {
        id: result.insertId,
        ...fundData,
        statusText: '未使用' // 添加状态文本
      };
      
      res.json({
        code: 200,
        message: '创建资金成功',
        data: newFund
      });
    })
    .catch(err => {
      console.error('创建资金错误:', err);
      return res.status(500).json({
        code: 500,
        message: '创建资金失败: ' + err.message
      });
    });
};

// 更新资金
exports.updateFund = (req, res) => {
  const fundId = req.params.id;
  const { name, platform, position, salaryRange, rechargeByName, amount, date } = req.body;

  // 验证必填字段
  if (!name || !platform || !position) {
    return res.status(400).json({
      code: 400,
      message: '资金名称、平台和招聘岗位是必填字段'
    });
  }

  const fundData = {
    name,
    platform,
    position,
    salary_range: salaryRange || '',
    recharge_by_name: rechargeByName || '',
    amount: amount || 0,
    date: date || new Date().toISOString().split('T')[0]
  };

  db.query('UPDATE funds SET ? WHERE id = ?', [fundData, fundId])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          message: '未找到指定的资金'
        });
      }

      // 添加状态文本映射
      let statusText = '';
      switch (fundData.status) {
        case 'unused':
          statusText = '未使用';
          break;
        case 'using':
          statusText = '使用中';
          break;
        case 'used':
          statusText = '已用完';
          break;
        case 'expired':
          statusText = '已过期';
          break;
        default:
          statusText = '未知';
      }

      const updatedFund = {
        id: fundId,
        ...fundData,
        statusText
      };

      res.json({
        code: 200,
        message: '更新资金成功',
        data: updatedFund
      });
    })
    .catch(err => {
      console.error('更新资金错误:', err);
      return res.status(500).json({
        code: 500,
        message: '更新资金失败'
      });
    });
};

// 删除资金
exports.deleteFund = (req, res) => {
  const fundId = req.params.id;
  
  db.query('DELETE FROM funds WHERE id = ?', [fundId])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          message: '未找到指定的资金'
        });
      }
      
      res.json({
        code: 200,
        message: '删除资金成功'
      });
    })
    .catch(err => {
      console.error('删除资金错误:', err);
      return res.status(500).json({
        code: 500,
        message: '删除资金失败'
      });
    });
};