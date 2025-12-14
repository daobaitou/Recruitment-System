const { db } = require('../config/database');

class WorkExperience {
  constructor(workExperience) {
    this.id = workExperience.id;
    this.candidate_id = workExperience.candidate_id;
    this.start_date = workExperience.start_date;
    this.end_date = workExperience.end_date;
    this.company_name = workExperience.company_name;
    this.position = workExperience.position;
    this.salary = workExperience.salary;
    this.created_at = workExperience.created_at;
    this.updated_at = workExperience.updated_at;
  }

  // 创建工作经历
  static create(newWorkExperience, callback) {
    const workExperienceData = {
      candidate_id: newWorkExperience.candidate_id,
      start_date: newWorkExperience.start_date,
      end_date: newWorkExperience.end_date,
      company_name: newWorkExperience.company_name,
      position: newWorkExperience.position,
      salary: newWorkExperience.salary
    };

    db.then(pool => {
      pool.query('INSERT INTO work_experiences SET ?', workExperienceData, (err, res) => {
        if (err) {
          console.error('创建工作经历错误:', err);
          callback(err, null);
          return;
        }

        const workExperience = {
          id: res.insertId,
          ...workExperienceData
        };
        
        callback(null, workExperience);
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 根据候选人ID查找工作经历
  static findByCandidateId(candidateId, callback) {
    db.then(pool => {
      pool.query('SELECT * FROM work_experiences WHERE candidate_id = ? ORDER BY start_date DESC', [candidateId], (err, res) => {
        if (err) {
          console.error('根据候选人ID查找工作经历错误:', err);
          callback(err, null);
          return;
        }

        callback(null, res.map(item => new WorkExperience(item)));
      });
    }).catch(err => {
      console.error('数据库连接错误:', err);
      callback(err, null);
    });
  }

  // 根据ID查找工作经历
  static findById(id, callback) {
    db.then(pool => {
      pool.query('SELECT * FROM work_experiences WHERE id = ?', [id], (err, res) => {
        if (err) {
          console.error('查找工作经历错误:', err);
          callback(err, null);
          return;
        }

        if (res.length) {
          callback(null, new WorkExperience(res[0]));
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

  // 更新工作经历信息
  static updateById(id, workExperience, callback) {
    // 构建更新字段
    const fields = [];
    const values = [];
    
    for (const key in workExperience) {
      if (workExperience[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(workExperience[key]);
      }
    }
    
    if (fields.length === 0) {
      callback({ kind: "no_fields_to_update" }, null);
      return;
    }
    
    values.push(id);

    db.then(pool => {
      pool.query(
        `UPDATE work_experiences SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err, res) => {
          if (err) {
            console.error('更新工作经历错误:', err);
            callback(err, null);
            return;
          }

          if (res.affectedRows == 0) {
            // 未找到要更新的记录
            callback({ kind: "not_found" }, null);
            return;
          }

          pool.query('SELECT * FROM work_experiences WHERE id = ?', [id], (err, res) => {
            if (err) {
              console.error('查找更新后的工作经历错误:', err);
              callback(err, null);
              return;
            }

            if (res.length) {
              callback(null, new WorkExperience(res[0]));
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

  // 删除工作经历
  static remove(id, callback) {
    db.then(pool => {
      pool.query('DELETE FROM work_experiences WHERE id = ?', id, (err, res) => {
        if (err) {
          console.error('删除工作经历错误:', err);
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

  // 根据候选人ID删除所有工作经历
  static removeByCandidateId(candidateId, callback) {
    db.then(pool => {
      pool.query('DELETE FROM work_experiences WHERE candidate_id = ?', candidateId, (err, res) => {
        if (err) {
          console.error('根据候选人ID删除工作经历错误:', err);
          callback(err, null);
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

module.exports = WorkExperience;