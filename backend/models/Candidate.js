// models/Candidate.js
const db = require('../config/database');

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
    this.process = candidate.process || 'invite';
    this.status = candidate.status || 'pending';
    this.interview_status = candidate.interview_status || 'pending';
  }

  // 创建候选人
  static create(newCandidate, callback) {
    const candidate = new Candidate(newCandidate);
    db.query('INSERT INTO candidates SET ?', candidate, (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, { id: res.insertId, ...candidate });
    });
  }

  // 根据ID获取候选人
  static findById(id, callback) {
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
      WHERE c.id = ?
    `, [id], (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (res.length) {
        callback(null, res[0]);
        return;
      }

      callback({ kind: "not_found" }, null);
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
    `, (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, res);
    });
  }

  // 更新候选人信息
  static updateById(id, candidate, callback) {
    db.query(
      "UPDATE candidates SET fund_id = ?, name = ?, position = ?, phone = ?, email = ?, source = ?, education = ?, experience = ?, expected_salary = ?, process = ?, status = ?, interview_status = ? WHERE id = ?",
      [candidate.fund_id, candidate.name, candidate.position, candidate.phone, candidate.email, candidate.source, candidate.education, candidate.experience, candidate.expected_salary, candidate.process, candidate.status, candidate.interview_status, id],
      (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          callback({ kind: "not_found" }, null);
          return;
        }

        callback(null, { id: id, ...candidate });
      }
    );
  }

  // 删除候选人
  static remove(id, callback) {
    db.query("DELETE FROM candidates WHERE id = ?", id, (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        callback({ kind: "not_found" }, null);
        return;
      }

      callback(null, res);
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
    `, [fundId], (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, res);
    });
  }
}

module.exports = Candidate;