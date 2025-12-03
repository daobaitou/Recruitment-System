const db = require('../config/database');

// 获取所有资金记录
exports.getFunds = (req, res) => {
  db.query('SELECT * FROM funds', (err, results) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: '获取资金列表时发生错误'
      });
      return;
    }

    const funds = results.map(fund => ({
      id: fund.id,
      name: fund.name,
      amount: parseFloat(fund.amount),
      platform: fund.platform,
      position: fund.position,
      rechargeById: fund.recharge_by,
      rechargeByName: fund.recharge_by_name || '未知',
      date: fund.date,
      status: fund.status,
      statusText: getStatusText(fund.status)
    }));

    res.json({
      code: 200,
      message: '获取资金列表成功',
      data: funds
    });
  });
};

// 根据ID获取资金详情
exports.getFundById = (req, res) => {
  const { id } = req.params;
  
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
  `, [id], (err, results) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: `获取资金详情时发生错误 id: ${id}`
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).send({
        code: 404,
        message: `未找到ID为${id}的资金`
      });
      return;
    }

    const fund = results[0];
    const formattedFund = {
      id: fund.id,
      name: fund.name,
      amount: parseFloat(fund.amount),
      platform: fund.platform,
      position: fund.position || '',
      rechargeById: fund.recharge_by || 0,
      rechargeByName: fund.recharge_by_name || '未知',
      date: fund.date,
      status: fund.status,
      statusText: fund.status_text
    };

    res.json({
      code: 200,
      message: '获取资金详情成功',
      data: formattedFund
    });
  });
};

// 创建资金记录
exports.createFund = (req, res) => {
  const { name, amount, platform, position, rechargeBy, rechargeByName, date, status } = req.body;

  // 处理充值人ID，如果为0则设置为null
  let recharge_by_value = rechargeBy;
  if (recharge_by_value === 0) {
    recharge_by_value = null;
  }

  const newFund = {
    name: name,
    amount: amount,
    platform: platform,
    position: position,
    recharge_by: recharge_by_value,
    recharge_by_name: rechargeByName,
    date: date,
    status: status
  };

  db.query('INSERT INTO funds SET ?', newFund, (err, result) => {
    if (err) {
      console.error('数据库插入错误:', err);
      res.status(500).send({
        code: 500,
        message: '创建资金记录时发生错误'
      });
      return;
    }

    const createdFund = {
      id: result.insertId,
      name: name,
      amount: parseFloat(amount),
      platform: platform,
      position: position,
      rechargeById: recharge_by_value,
      rechargeByName: rechargeByName || '未知',
      date: date,
      status: status,
      statusText: getStatusText(status)
    };

    res.json({
      code: 200,
      message: '创建资金记录成功',
      data: createdFund
    });
  });
};

// 更新资金记录
exports.updateFund = (req, res) => {
  const { id } = req.params;
  const { name, amount, platform, position, rechargeBy, rechargeByName, date, status } = req.body;
  
  // 处理充值人ID，如果为0则设置为null
  let recharge_by_value = rechargeBy;
  if (recharge_by_value === 0) {
    recharge_by_value = null;
  }
  
  const updatedFund = {
    name: name,
    amount: amount,
    platform: platform,
    position: position,
    recharge_by: recharge_by_value,
    recharge_by_name: rechargeByName,
    date: date,
    status: status
  };
  
  // 移除值为undefined的字段
  Object.keys(updatedFund).forEach(key => {
    if (updatedFund[key] === undefined) {
      delete updatedFund[key];
    }
  });

  db.query('UPDATE funds SET ? WHERE id = ?', [updatedFund, id], (err, result) => {
    if (err) {
      console.error('数据库更新错误:', err);
      res.status(500).send({
        code: 500,
        message: `更新资金记录时发生错误 id: ${id}`,
        error: err.message
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send({
        code: 404,
        message: `未找到ID为${id}的资金`
      });
      return;
    }

    const updatedFundData = {
      id: parseInt(id),
      name: name,
      amount: parseFloat(amount),
      platform: platform,
      position: position,
      rechargeById: recharge_by_value,
      rechargeByName: rechargeByName || '未知',
      date: date,
      status: status,
      statusText: getStatusText(status)
    };

    res.json({
      code: 200,
      message: '更新资金记录成功',
      data: updatedFundData
    });
  });
};

// 删除资金记录
exports.deleteFund = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM funds WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: `删除资金记录时发生错误 id: ${id}`
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send({
        code: 404,
        message: `未找到ID为${id}的资金`
      });
      return;
    }

    res.json({
      code: 200,
      message: '删除资金记录成功'
    });
  });
};

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'unused': return '未使用';
    case 'using': return '使用中';
    case 'used': return '已用完';
    case 'expired': return '已过期';
    default: return '未知';
  }
}