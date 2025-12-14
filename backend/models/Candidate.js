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
    this.first_interviewer = candidate.first_interviewer; // 新增字段
    this.first_interview_result = candidate.first_interview_result; // 新增字段
    this.second_interview_date = candidate.second_interview_date;
    this.second_interview_time = candidate.second_interview_time;
    this.second_interview_location = candidate.second_interview_location;
    this.second_interview_notes = candidate.second_interview_notes;
    this.second_interviewer = candidate.second_interviewer; // 新增字段
    this.second_interview_result = candidate.second_interview_result; // 新增字段
    this.final_interview_result = candidate.final_interview_result; // 新增字段
    this.final_evaluation = candidate.final_evaluation; // 新增字段
    this.schedule_remarks = candidate.schedule_remarks;
    this.created_at = candidate.created_at;
    // 添加个人详细信息字段
    this.birth_date = candidate.birth_date;
    this.ethnicity = candidate.ethnicity;
    this.native_place = candidate.native_place;
    this.marital_status = candidate.marital_status;
    this.current_address = candidate.current_address;
    this.id_number = candidate.id_number;
    this.household_registration_address = candidate.household_registration_address;
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
    console.log('更新候选人，ID:', id);
    console.log('更新数据:', candidate);
    
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
      console.log('没有字段需要更新，直接获取候选人数据');
      // 直接从数据库获取最新数据
      this.findById(id, callback);
      return;
    }
    
    sql += fields.join(", ");
    sql += " WHERE id = ?";
    values.push(id);
    
    console.log('执行SQL:', sql);
    console.log('参数:', values);
    
    db.query(sql, values)
      .then(([res]) => {
        console.log('更新结果:', res);
        if (res.affectedRows == 0) {
          console.log('未找到要更新的候选人，ID:', id);
          callback({ kind: "not_found" }, null);
          return;
        }

        console.log('更新成功，获取最新数据');
        // 更新成功后，从数据库获取最新的数据
        this.findById(id, callback);
      })
      .catch(err => {
        console.error('更新候选人时发生错误:', err);
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

  // 删除指定基金下的所有候选人
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