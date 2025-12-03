const Candidate = require('../models/Candidate');

// 获取候选人列表
exports.getCandidates = (req, res) => {
  Candidate.getAll((err, candidates) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: err.message || "获取候选人列表时发生错误"
      });
      return;
    }

    const formattedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      fundId: candidate.fund_id || null,
      fundPlatform: candidate.fund_platform || '',
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone,
      email: candidate.email,
      source: candidate.source,
      education: candidate.education,
      experience: candidate.experience,
      expectedSalary: candidate.expected_salary,
      process: candidate.process,
      status: candidate.status,
      interviewStatus: candidate.interview_status,
      statusText: candidate.status_text || '待约',
      createdAt: candidate.created_at
    }));

    res.json({
      code: 200,
      message: '获取候选人列表成功',
      data: formattedCandidates
    });
  });
};

// 根据ID获取候选人详情
exports.getCandidateById = (req, res) => {
  const { id } = req.params;
  
  Candidate.findById(id, (err, candidate) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的候选人`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `获取候选人详情时发生错误 id: ${id}`
      });
      return;
    }

    const formattedCandidate = {
      id: candidate.id,
      fundId: candidate.fund_id || null,
      fundPlatform: candidate.fund_platform || '',
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone,
      email: candidate.email,
      source: candidate.source,
      education: candidate.education,
      experience: candidate.experience,
      expectedSalary: candidate.expected_salary,
      process: candidate.process,
      status: candidate.status,
      interviewStatus: candidate.interview_status,
      statusText: candidate.status_text || '待约',
      createdAt: candidate.created_at
    };

    res.json({
      code: 200,
      message: '获取候选人详情成功',
      data: formattedCandidate
    });
  });
};

// 创建候选人
exports.createCandidate = (req, res) => {
  const { fundId, name, position, phone, email, source, education, experience, expectedSalary, process, status, interviewStatus } = req.body;

  // 验证必填字段
  if (!name || !position) {
    res.status(400).send({
      code: 400,
      message: "姓名和职位是必填字段!"
    });
    return;
  }

  // 创建候选人对象
  const newCandidate = {
    fund_id: fundId,
    name: name,
    position: position,
    phone: phone,
    email: email,
    source: source,
    education: education,
    experience: experience,
    expected_salary: expectedSalary,
    process: process || 'invite',
    status: status || 'pending',
    interview_status: interviewStatus || 'pending'
  };

  // 保存候选人到数据库
  Candidate.create(newCandidate, (err, candidate) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: err.message || "创建候选人时发生错误"
      });
      return;
    }

    const formattedCandidate = {
      id: candidate.id,
      fundId: candidate.fund_id || null,
      fundPlatform: '',
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone,
      email: candidate.email,
      source: candidate.source,
      education: candidate.education,
      experience: candidate.experience,
      expectedSalary: candidate.expected_salary,
      process: candidate.process,
      status: candidate.status,
      interviewStage: candidate.interview_stage,
      interviewStatus: candidate.interview_status,
      statusText: '待约',
      createdAt: candidate.created_at
    };

    res.status(201).json({
      code: 200,
      message: '创建候选人成功',
      data: formattedCandidate
    });
  });
};

// 更新候选人
exports.updateCandidate = (req, res) => {
  const { id } = req.params;
  const { fundId, name, position, phone, email, source, education, experience, expectedSalary, process, status, interviewStage, interviewStatus } = req.body;

  // 创建候选人对象
  const candidate = {
    fund_id: fundId,
    name: name,
    position: position,
    phone: phone,
    email: email,
    source: source,
    education: education,
    experience: experience,
    expected_salary: expectedSalary,
    process: process,
    status: status,
    interview_status: interviewStatus
  };

  Candidate.updateById(id, candidate, (err, result) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的候选人`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `更新候选人时发生错误 id: ${id}`
      });
      return;
    }

    const updatedCandidate = {
      id: parseInt(id),
      fundId: fundId,
      fundPlatform: '',
      name: name,
      position: position,
      phone: phone,
      email: email,
      source: source,
      education: education,
      experience: experience,
      expectedSalary: expectedSalary,
      process: process,
      status: status,
      interviewStatus: interviewStatus,
      statusText: getStatusText(interviewStatus),
      createdAt: result.created_at
    };

    res.json({
      code: 200,
      message: '更新候选人成功',
      data: updatedCandidate
    });
  });
};

// 删除候选人
exports.deleteCandidate = (req, res) => {
  const { id } = req.params;
  
  Candidate.remove(id, (err, result) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的候选人`
        });
        return;
      }
      
      res.status(500).send({
        code: 500,
        message: `删除候选人时发生错误 id: ${id}`
      });
      return;
    }

    res.json({
      code: 200,
      message: '删除候选人成功',
      data: { id: parseInt(id) }
    });
  });
};

// 根据资金ID获取候选人
exports.getCandidatesByFundId = (req, res) => {
  const { fundId } = req.params;
  
  Candidate.findByFundId(fundId, (err, candidates) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: err.message || "获取候选人列表时发生错误"
      });
      return;
    }

    const formattedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      fundId: candidate.fund_id || null,
      fundPlatform: candidate.fund_platform || '',
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone,
      email: candidate.email,
      source: candidate.source,
      education: candidate.education,
      experience: candidate.experience,
      expectedSalary: candidate.expected_salary,
      process: candidate.process,
      status: candidate.status,
      interviewStatus: candidate.interview_status,
      statusText: candidate.status_text || '待约',
      createdAt: candidate.created_at
    }));

    res.json({
      code: 200,
      message: '获取候选人列表成功',
      data: formattedCandidates
    });
  });
};

// 获取面试状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待约',
    'unconfirmed': '未确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'rejected': '已拒'
  };
  return statusMap[status] || '待约';
};