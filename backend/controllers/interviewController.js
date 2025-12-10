const Interview = require('../models/Interview');
const { body, validationResult } = require('express-validator');

// 获取所有面试记录
exports.getAllInterviews = (req, res) => {
  Interview.getAll((err, interviews) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: err.message || "获取面试记录列表时发生错误"
      });
      return;
    }

    // 格式化面试记录数据
    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      candidateId: interview.candidate_id,
      round: interview.round,
      title: interview.title,
      description: interview.description,
      interviewer: interview.interviewer,
      date: interview.date,
      time: interview.time,
      location: interview.location,
      status: interview.status,
      feedback: interview.feedback,
      rating: interview.rating,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at
    }));

    res.json({
      code: 200,
      message: '获取面试记录列表成功',
      data: formattedInterviews
    });
  });
};

// 根据ID获取面试记录详情
exports.getInterviewById = (req, res) => {
  const { id } = req.params;
  
  Interview.findById(id, (err, interview) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的面试记录`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `获取面试记录详情时发生错误 id: ${id}`
      });
      return;
    }

    const formattedInterview = {
      id: interview.id,
      candidateId: interview.candidate_id,
      round: interview.round,
      title: interview.title,
      description: interview.description,
      interviewer: interview.interviewer,
      date: interview.date,
      time: interview.time,
      location: interview.location,
      status: interview.status,
      feedback: interview.feedback,
      rating: interview.rating,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at
    };

    res.json({
      code: 200,
      message: '获取面试记录详情成功',
      data: formattedInterview
    });
  });
};

// 根据候选人ID获取面试记录
exports.getInterviewsByCandidateId = (req, res) => {
  const { candidateId } = req.params;
  
  Interview.findByCandidateId(candidateId, (err, interviews) => {
    if (err) {
      console.error(`获取候选人面试记录时发生错误 candidateId: ${candidateId}`, err);
      res.status(500).send({
        code: 500,
        message: `获取候选人面试记录时发生错误 candidateId: ${candidateId}`
      });
      return;
    }

    // 格式化面试记录数据
    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      candidateId: interview.candidate_id,
      round: interview.round,
      title: interview.title,
      description: interview.description,
      interviewer: interview.interviewer,
      date: interview.date,
      time: interview.time,
      location: interview.location,
      status: interview.status,
      feedback: interview.feedback,
      rating: interview.rating,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at
    }));

    res.json({
      code: 200,
      message: '获取候选人面试记录成功',
      data: formattedInterviews
    });
  });
};

// 创建面试记录
exports.createInterview = [
  // 验证字段
  body('candidateId').isInt().withMessage('候选人ID必须是整数'),
  body('round').isIn(['first-interview', 'second-interview', 'third-interview', 'hr-interview', 'final-interview']).withMessage('面试轮次值不正确'),
  body('title').notEmpty().withMessage('标题不能为空'),
  body('interviewer').notEmpty().withMessage('面试官不能为空'),
  body('date').isISO8601().withMessage('日期格式不正确'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('时间格式不正确'),
  body('location').notEmpty().withMessage('地点不能为空'),

  (req, res) => {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("请求参数验证失败:", errors.array());
      return res.status(400).json({
        code: 400,
        message: '请求参数验证失败',
        errors: errors.array()
      });
    }

    const { candidateId, round, title, description, interviewer, date, time, location, status, feedback, rating } = req.body;
    
    console.log("收到创建面试记录请求:", req.body);

    // 创建面试记录对象
    const newInterview = {
      candidate_id: candidateId,
      round: round,
      title: title,
      description: description || '',
      interviewer: interviewer,
      date: date.split('T')[0], // 修复日期格式问题，只取日期部分
      time: time,
      location: location,
      status: status || 'scheduled',
      feedback: feedback || '',
      rating: rating || 0
    };

    console.log("准备创建的面试记录:", newInterview);

    // 保存面试记录到数据库
    Interview.create(newInterview, (err, interview) => {
      if (err) {
        console.error("创建面试记录时发生错误:", err);
        res.status(500).send({
          code: 500,
          message: err.message || "创建面试记录时发生错误"
        });
        return;
      }
      
      // 格式化返回数据
      const formattedInterview = {
        id: interview.id,
        candidateId: interview.candidate_id,
        round: interview.round,
        title: interview.title,
        description: interview.description,
        interviewer: interview.interviewer,
        date: interview.date,
        time: interview.time,
        location: interview.location,
        status: interview.status,
        feedback: interview.feedback,
        rating: interview.rating,
        createdAt: interview.created_at,
        updatedAt: interview.updated_at
      };

      console.log("面试记录创建成功:", formattedInterview);
      
      res.json({
        code: 200,
        message: '面试记录创建成功',
        data: formattedInterview
      });
    });
  }
];

// 更新面试记录
exports.updateInterview = (req, res) => {
  const { id } = req.params;
  
  // 检查验证结果
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '请求参数验证失败',
      errors: errors.array()
    });
  }

  const { candidateId, round, title, description, interviewer, date, time, location, status, feedback, rating } = req.body;

  // 创建面试记录对象
  const interview = {
    candidate_id: candidateId,
    round: round,
    title: title,
    description: description || '',
    interviewer: interviewer,
    date: date,
    time: time,
    location: location,
    status: status || 'scheduled',
    feedback: feedback || '',
    rating: rating || 0
  };

  // 更新面试记录信息
  Interview.updateById(id, interview, (err, updatedInterview) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的面试记录`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `更新面试记录时发生错误 id: ${id}`
      });
      return;
    }

    // 格式化返回数据
    const formattedInterview = {
      id: updatedInterview.id,
      candidateId: updatedInterview.candidate_id,
      round: updatedInterview.round,
      title: updatedInterview.title,
      description: updatedInterview.description,
      interviewer: updatedInterview.interviewer,
      date: updatedInterview.date,
      time: updatedInterview.time,
      location: updatedInterview.location,
      status: updatedInterview.status,
      feedback: updatedInterview.feedback,
      rating: updatedInterview.rating,
      createdAt: updatedInterview.created_at,
      updatedAt: updatedInterview.updated_at
    };
    
    res.json({
      code: 200,
      message: '面试记录更新成功',
      data: formattedInterview
    });
  });
};

// 删除面试记录
exports.deleteInterview = (req, res) => {
  const { id } = req.params;
  
  Interview.remove(id, (err, result) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的面试记录`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `删除面试记录时发生错误 id: ${id}`
      });
      return;
    }

    res.json({
      code: 200,
      message: '面试记录删除成功'
    });
  });
};