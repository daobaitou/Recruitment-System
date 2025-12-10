const { db } = require('../config/database');

class Interview {
  constructor(interview) {
    this.candidate_id = interview.candidate_id;
    this.round = interview.round; // 面试轮次: first, second
    this.title = interview.title;
    this.description = interview.description;
    this.interviewer = interview.interviewer;
    this.date = interview.date;
    this.time = interview.time;
    this.location = interview.location;
    this.status = interview.status || 'scheduled'; // scheduled, completed, cancelled
    this.feedback = interview.feedback || '';
    this.rating = interview.rating || 0;
  }

  // 创建面试记录
  static create(newInterview, callback) {
    // 映射前端字段到数据库字段
    const interviewData = {
      candidate_id: newInterview.candidate_id,
      round: newInterview.round,
      title: newInterview.title,
      description: newInterview.description || '',
      interviewer: newInterview.interviewer,
      date: newInterview.date,
      time: newInterview.time,
      location: newInterview.location,
      status: newInterview.status || 'scheduled',
      feedback: newInterview.feedback || '',
      rating: newInterview.rating || 0
    };

    db.query('INSERT INTO interviews SET ?', interviewData)
      .then(([res]) => {
        // 返回创建的面试记录
        const createdInterview = {
          id: res.insertId,
          ...interviewData
        };
        
        callback(null, createdInterview);
      })
      .catch(err => {
        console.error('数据库插入错误:', err);
        callback(err, null);
      });
  }

  // 根据ID获取面试记录
  static findById(id, callback) {
    db.query('SELECT * FROM interviews WHERE id = ?', [id], (err, res) => {
      if (err) {
        console.error('数据库查询错误:', err);
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

  // 根据候选人ID获取面试记录
  static findByCandidateId(candidateId, callback) {
    db.query('SELECT * FROM interviews WHERE candidate_id = ? ORDER BY date DESC, time DESC', [candidateId])
      .then(([res]) => {
        callback(null, res);
      })
      .catch(err => {
        console.error('数据库查询错误:', err);
        callback(err, null);
      });
  }

  // 获取所有面试记录
  static getAll(callback) {
    db.query('SELECT * FROM interviews ORDER BY date DESC, time DESC', (err, res) => {
      if (err) {
        console.error('数据库查询错误:', err);
        callback(err, null);
        return;
      }

      callback(null, res);
    });
  }

  // 更新面试记录
  static updateById(id, interview, callback) {
    // 映射字段
    const interviewData = {
      candidate_id: interview.candidate_id,
      round: interview.round,
      title: interview.title,
      description: interview.description,
      interviewer: interview.interviewer,
      date: interview.date,
      time: interview.time,
      location: interview.location,
      status: interview.status,
      feedback: interview.feedback,
      rating: interview.rating
    };

    db.query('UPDATE interviews SET ? WHERE id = ?', [interviewData, id], (err, res) => {
      if (err) {
        console.error('数据库更新错误:', err);
        callback(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        callback({ kind: "not_found" }, null);
        return;
      }

      callback(null, { id: id, ...interviewData });
    });
  }

  // 删除面试记录
  static remove(id, callback) {
    db.query('DELETE FROM interviews WHERE id = ?', id, (err, res) => {
      if (err) {
        console.error('数据库删除错误:', err);
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
}

module.exports = Interview;