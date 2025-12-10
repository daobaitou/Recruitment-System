// models/Candidate.js
const { db } = require('../config/database');

class Candidate {
  constructor(candidate) {
    this.fund_id = candidate.fund_id;
    this.name = candidate.name;
    this.position = candidate.position;
    this.phone = candidate.phone;
    this.email = candidate.email;
    this.source = candidate.source;
    this.education = candidate.education;
    this.experience = candidate.experience;
    this.expected_salary = candidate.expected_salary;
    this.process = candidate.process;
    this.status = candidate.status;
    this.interview_status = candidate.interview_status;
    this.first_interview_date = candidate.first_interview_date;
    this.first_interview_time = candidate.first_interview_time;
    this.first_interview_location = candidate.first_interview_location;
    this.first_interview_notes = candidate.first_interview_notes;
    this.second_interview_date = candidate.second_interview_date;
    this.second_interview_time = candidate.second_interview_time;
    this.second_interview_location = candidate.second_interview_location;
    this.second_interview_notes = candidate.second_interview_notes;
    this.schedule_remarks = candidate.schedule_remarks;
    this.created_at = candidate.created_at;
  }

  // 创建候选人
  static create(newCandidate, callback) {
    const candidate = new Candidate(newCandidate);
    db.query('INSERT INTO candidates SET ?', candidate)
      .then(([res]) => {
        callback(null, { id: res.insertId, ...candidate });
      })
      .catch(err => {
        callback(err, null);
      });
  }

  // 根据ID获取候选人
  static findById(id, callback) {
    db.query(`
      SELECT 
        c.*, 
        f.platform as fund_platform
      FROM candidates c
      LEFT JOIN funds f ON c.fund_id = f.id
      WHERE c.id = ?
    `, [id])
      .then(([res]) => {
        if (res.length) {
          callback(null, res[0]);
          return;
        }

        callback({ kind: "not_found" }, null);
      })
      .catch(err => {
        console.error('数据库查询错误:', err);
        callback(err, null);
      });
  }

  // 获取所有候选人
  static getAll(callback) {
    db.query(`
      SELECT 
        c.*, 
        f.platform as fund_platform,
        CASE 
          WHEN c.interview_status = 'pending' THEN '待约'
          WHEN c.interview_status = 'unconfirmed' THEN '未确认'
          WHEN c.interview_status = 'confirmed' THEN '已确认'
          WHEN c.interview_status = 'completed' THEN '已完成'
          WHEN c.interview_status = 'rejected' THEN '已拒'
          ELSE '待约'
        END as status_text
      FROM candidates c
      LEFT JOIN funds f ON c.fund_id = f.id
      ORDER BY c.created_at DESC
    `)
      .then(([res]) => {
        callback(null, res);
      })
      .catch(err => {
        console.error('数据库查询错误:', err);
        callback(err, null);
      });
  }

  // 根据资金ID获取候选人
  static findByFundId(fundId, callback) {
    db.query(`
      SELECT 
        c.*, 
        f.platform as fund_platform,
        CASE 
          WHEN c.interview_status = 'pending' THEN '待约'
          WHEN c.interview_status = 'unconfirmed' THEN '未确认'
          WHEN c.interview_status = 'confirmed' THEN '已确认'
          WHEN c.interview_status = 'completed' THEN '已完成'
          WHEN c.interview_status = 'rejected' THEN '已拒'
          ELSE '待约'
        END as status_text
      FROM candidates c
      LEFT JOIN funds f ON c.fund_id = f.id
      WHERE c.fund_id = ?
      ORDER BY c.created_at DESC
    `, [fundId])
      .then(([res]) => {
        callback(null, res);
      })
      .catch(err => {
        callback(err, null);
      });
  }

  // 更新候选人
  static updateById(id, candidate, callback) {
    // 构建动态更新语句
    let sql = "UPDATE candidates SET ";
    const fields = [];
    const values = [];
    
    // 添加所有提供的字段
    for (const key in candidate) {
      if (candidate.hasOwnProperty(key)) {
        fields.push(`${key} = ?`);
        values.push(candidate[key]);
      }
    }
    
    // 如果没有字段需要更新，则直接返回成功
    if (fields.length === 0) {
      callback(null, { id: id, ...candidate });
      return;
    }
    
    sql += fields.join(", ");
    sql += " WHERE id = ?";
    values.push(id);
    
    db.query(sql, values)
      .then(([res]) => {
        if (res.affectedRows == 0) {
          callback({ kind: "not_found" }, null);
          return;
        }

        callback(null, { id: id, ...candidate });
      })
      .catch(err => {
        callback(err, null);
      });
  }

  // 删除候选人
  static remove(id, callback) {
    db.query("DELETE FROM candidates WHERE id = ?", id)
      .then(([res]) => {
        if (res.affectedRows == 0) {
          callback({ kind: "not_found" }, null);
          return;
        }

        callback(null, res);
      })
      .catch(err => {
        callback(err, null);
      });
  }

  // 删除指定资金下的所有候选人
  static removeByFundId(fundId, callback) {
    db.query("DELETE FROM candidates WHERE fund_id = ?", fundId)
      .then(([res]) => {
        callback(null, res);
      })
      .catch(err => {
        callback(err, null);
      });
  }
}

module.exports = Candidate;