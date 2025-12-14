const { db } = require('../config/database');

class Fund {
  constructor(fund) {
    this.id = fund.id;
    this.platform = fund.platform;
    this.amount = fund.amount;
    this.recharge_by_name = fund.recharge_by_name;
    this.recharge_by_id = fund.recharge_by_id;
    this.created_at = fund.created_at;
  }

  // 创建资金记录
  static create(newFund, callback) {
    const fundData = {
      platform: newFund.platform,
      amount: newFund.amount,
      recharge_by_name: newFund.recharge_by_name,
      recharge_by_id: newFund.recharge_by_id
    };

    db.then(pool => {
      pool.query('INSERT INTO funds SET ?', fundData, (err, res) => {
        if (err) {
          console.error('创建资金记录错误:', err);
          callback(err, null);
          return;
        }

        const fund = {
          id: res.insertId,
          ...fundData
        };
        
        callback(null, fund);
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 根据ID查找资金记录
  static findById(id, callback) {
    db.then(pool => {
      pool.query('SELECT * FROM funds WHERE id = ?', [id], (err, res) => {
        if (err) {
          console.error('查找资金记录错误:', err);
          callback(err, null);
          return;
        }

        if (res.length) {
          callback(null, new Fund(res[0]));
          return;
        }

        // 未找到
        callback({ kind: "not_found" }, null);
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 获取所有资金记录
  static getAll(callback) {
    db.then(pool => {
      pool.query('SELECT * FROM funds', (err, res) => {
        if (err) {
          console.error('获取资金记录列表错误:', err);
          callback(err, null);
          return;
        }

        callback(null, res.map(item => new Fund(item)));
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 更新资金记录信息
  static updateById(id, fund, callback) {
    // 构建更新字段
    const fields = [];
    const values = [];
    
    for (const key in fund) {
      if (fund[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(fund[key]);
      }
    }
    
    if (fields.length === 0) {
      callback({ kind: "no_fields_to_update" }, null);
      return;
    }
    
    values.push(id);

    db.then(pool => {
      pool.query(
        `UPDATE funds SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err, res) => {
          if (err) {
            console.error('更新资金记录错误:', err);
            callback(err, null);
            return;
          }

          if (res.affectedRows == 0) {
            // 未找到要更新的记录
            callback({ kind: "not_found" }, null);
            return;
          }

          pool.query('SELECT * FROM funds WHERE id = ?', [id], (err, res) => {
            if (err) {
              console.error('查找更新后的资金记录错误:', err);
              callback(err, null);
              return;
            }

            if (res.length) {
              callback(null, new Fund(res[0]));
              return;
            }

            callback({ kind: "not_found" }, null);
          });
        }
      );
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 删除资金记录
  static remove(id, callback) {
    db.then(pool => {
      pool.query('DELETE FROM funds WHERE id = ?', id, (err, res) => {
        if (err) {
          console.error('删除资金记录错误:', err);
          callback(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          // 未找到要删除的记录
          callback({ kind: "not_found" }, null);
          return;
        }

        callback(null, res);
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }
}

module.exports = Fund;