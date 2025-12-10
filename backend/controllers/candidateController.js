const Candidate = require('../models/Candidate');
const { body, validationResult } = require('express-validator');

// 获取所有候选人列表
exports.getAllCandidates = (req, res) => {
  Candidate.getAll((err, candidates) => {
    if (err) {
      console.error('获取候选人列表错误:', err);
      res.status(500).send({
        code: 500,
        message: err.message || "获取候选人列表时发生错误"
      });
      return;
    }

    // 格式化候选人数据
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
      firstInterviewDate: candidate.first_interview_date,
      firstInterviewTime: candidate.first_interview_time,
      firstInterviewLocation: candidate.first_interview_location,
      firstInterviewNotes: candidate.first_interview_notes,
      firstInterviewer: candidate.first_interviewer || '',
      firstInterviewResult: candidate.first_interview_result || '',
      secondInterviewDate: candidate.second_interview_date,
      secondInterviewTime: candidate.second_interview_time,
      secondInterviewLocation: candidate.second_interview_location,
      secondInterviewNotes: candidate.second_interview_notes,
      secondInterviewer: candidate.second_interviewer || '',
      secondInterviewResult: candidate.second_interview_result || '',
      finalInterviewResult: candidate.final_interview_result || '',
      finalEvaluation: candidate.final_evaluation || '',
      scheduleRemarks: candidate.schedule_remarks,
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
      
      console.error('获取候选人详情错误:', err);
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
      firstInterviewDate: candidate.first_interview_date,
      firstInterviewTime: candidate.first_interview_time,
      firstInterviewLocation: candidate.first_interview_location,
      firstInterviewNotes: candidate.first_interview_notes,
      firstInterviewer: candidate.first_interviewer || '',
      firstInterviewResult: candidate.first_interview_result || '',
      secondInterviewDate: candidate.second_interview_date,
      secondInterviewTime: candidate.second_interview_time,
      secondInterviewLocation: candidate.second_interview_location,
      secondInterviewNotes: candidate.second_interview_notes,
      secondInterviewer: candidate.second_interviewer || '',
      secondInterviewResult: candidate.second_interview_result || '',
      finalInterviewResult: candidate.final_interview_result || '',
      finalEvaluation: candidate.final_evaluation || '',
      scheduleRemarks: candidate.schedule_remarks,
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
  // 从请求体中提取参数
  const {
    fundId,
    name,
    position,
    phone,
    email,
    source,
    education,
    experience,
    expectedSalary,
    process,
    status,
    interviewStatus,
    firstInterviewDate,
    firstInterviewTime,
    firstInterviewLocation,
    firstInterviewNotes,
    firstInterviewer, // 新增字段
    secondInterviewDate,
    secondInterviewTime,
    secondInterviewLocation,
    secondInterviewNotes,
    secondInterviewer, // 新增字段
    scheduleRemarks
  } = req.body;
  
  console.log('收到创建候选人请求:', req.body);

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
    phone: phone || '',
    email: email || '',
    source: source || '',
    education: education || '',
    experience: experience || '',
    expected_salary: expectedSalary || '',
    process: process || 'invite', // 默认为邀约阶段
    status: 'pending',
    interview_status: interviewStatus || 'pending', // 默认为待约状态
    first_interviewer: firstInterviewer || '',
    second_interviewer: secondInterviewer || '',
    first_interview_result: firstInterviewResult || '',
    second_interview_result: secondInterviewResult || '',
    final_interview_result: finalInterviewResult || '',
    final_evaluation: finalEvaluation || ''
  };
  
  console.log('准备创建候选人对象:', newCandidate);

  // 保存候选人到数据库
  Candidate.create(newCandidate, (err, candidate) => {
    if (err) {
      console.error('创建候选人错误:', err);
      res.status(500).send({
        code: 500,
        message: err.message || "创建候选人时发生错误"
      });
      return;
    }

    console.log('候选人创建成功:', candidate);
    
    // 格式化返回数据
    const formattedCandidate = {
      id: candidate.id,
      fundId: candidate.fund_id,
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
      firstInterviewDate: candidate.first_interview_date,
      firstInterviewTime: candidate.first_interview_time,
      firstInterviewLocation: candidate.first_interview_location,
      firstInterviewNotes: candidate.first_interview_notes,
      firstInterviewer: candidate.first_interviewer || '',
      secondInterviewDate: candidate.second_interview_date,
      secondInterviewTime: candidate.second_interview_time,
      secondInterviewLocation: candidate.second_interview_location,
      secondInterviewNotes: candidate.second_interview_notes,
      secondInterviewer: candidate.second_interviewer || '',
      scheduleRemarks: candidate.schedule_remarks,
      createdAt: candidate.created_at
    };
    
    res.json({
      code: 200,
      message: '候选人创建成功',
      data: formattedCandidate
    });
  });
};

// 更新候选人
exports.updateCandidate = (req, res) => {
  const { id } = req.params;
  const { fundId, name, position, phone, email, source, education, experience, expectedSalary, process, status, interviewStatus,
    firstInterviewDate, firstInterviewTime, firstInterviewLocation, firstInterviewNotes, firstInterviewer, firstInterviewResult,
    secondInterviewDate, secondInterviewTime, secondInterviewLocation, secondInterviewNotes, secondInterviewer, secondInterviewResult,
    finalInterviewResult, finalEvaluation,
    scheduleRemarks } = req.body;

  // 创建候选人对象（只包含实际提供的字段）
  const candidate = {};
  
  // 只有当fundId明确提供时才更新，允许设置为null
  if (req.body.hasOwnProperty('fundId')) {
    candidate.fund_id = fundId !== undefined ? fundId : null;
  }
  if (name !== undefined) candidate.name = name;
  if (position !== undefined) candidate.position = position;
  if (phone !== undefined) candidate.phone = phone;
  if (email !== undefined) candidate.email = email;
  if (source !== undefined) candidate.source = source;
  if (education !== undefined) candidate.education = education;
  if (experience !== undefined) candidate.experience = experience;
  if (expectedSalary !== undefined) candidate.expected_salary = expectedSalary;
  if (process !== undefined) candidate.process = process;
  if (status !== undefined) candidate.status = status;
  if (interviewStatus !== undefined) candidate.interview_status = interviewStatus;
  if (firstInterviewDate !== undefined) candidate.first_interview_date = firstInterviewDate;
  if (firstInterviewTime !== undefined) candidate.first_interview_time = firstInterviewTime;
  if (firstInterviewLocation !== undefined) candidate.first_interview_location = firstInterviewLocation;
  if (firstInterviewNotes !== undefined) candidate.first_interview_notes = firstInterviewNotes;
  if (firstInterviewer !== undefined) candidate.first_interviewer = firstInterviewer;
  if (firstInterviewResult !== undefined) candidate.first_interview_result = firstInterviewResult;
  if (secondInterviewDate !== undefined) candidate.second_interview_date = secondInterviewDate;
  if (secondInterviewTime !== undefined) candidate.second_interview_time = secondInterviewTime;
  if (secondInterviewLocation !== undefined) candidate.second_interview_location = secondInterviewLocation;
  if (secondInterviewNotes !== undefined) candidate.second_interview_notes = secondInterviewNotes;
  if (secondInterviewer !== undefined) candidate.second_interviewer = secondInterviewer;
  if (secondInterviewResult !== undefined) candidate.second_interview_result = secondInterviewResult;
  if (finalInterviewResult !== undefined) candidate.final_interview_result = finalInterviewResult;
  if (finalEvaluation !== undefined) candidate.final_evaluation = finalEvaluation;
  if (scheduleRemarks !== undefined) candidate.schedule_remarks = scheduleRemarks;
  
  // 确保必填字段有默认值
  if (candidate.status === undefined) candidate.status = 'pending';
  if (candidate.interview_status === undefined) candidate.interview_status = 'pending';

  // 更新候选人信息
  Candidate.updateById(id, candidate, (err, updatedCandidate) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          code: 404,
          message: `未找到ID为${id}的候选人`
        });
        return;
      }
      
      console.error('更新候选人错误:', err);
      res.status(500).send({
        code: 500,
        message: `更新候选人时发生错误 id: ${id}`
      });
      return;
    }

    // 格式化返回数据
    const formattedCandidate = {
      id: updatedCandidate.id,
      fundId: updatedCandidate.fund_id,
      fundPlatform: updatedCandidate.fund_platform || '',
      name: updatedCandidate.name,
      position: updatedCandidate.position,
      phone: updatedCandidate.phone,
      email: updatedCandidate.email,
      source: updatedCandidate.source,
      education: updatedCandidate.education,
      experience: updatedCandidate.experience,
      expectedSalary: updatedCandidate.expected_salary,
      process: updatedCandidate.process,
      status: updatedCandidate.status,
      interviewStatus: updatedCandidate.interview_status,
      statusText: updatedCandidate.status_text || '待约',
      firstInterviewDate: updatedCandidate.first_interview_date,
      firstInterviewTime: updatedCandidate.first_interview_time,
      firstInterviewLocation: updatedCandidate.first_interview_location,
      firstInterviewNotes: updatedCandidate.first_interview_notes,
      firstInterviewer: updatedCandidate.first_interviewer || '',
      firstInterviewResult: updatedCandidate.first_interview_result || '',
      secondInterviewDate: updatedCandidate.second_interview_date,
      secondInterviewTime: updatedCandidate.second_interview_time,
      secondInterviewLocation: updatedCandidate.second_interview_location,
      secondInterviewNotes: updatedCandidate.second_interview_notes,
      secondInterviewer: updatedCandidate.second_interviewer || '',
      secondInterviewResult: updatedCandidate.second_interview_result || '',
      finalInterviewResult: updatedCandidate.final_interview_result || '',
      finalEvaluation: updatedCandidate.final_evaluation || '',
      scheduleRemarks: updatedCandidate.schedule_remarks,
      createdAt: updatedCandidate.created_at
    };
    
    res.json({
      code: 200,
      message: '候选人更新成功',
      data: formattedCandidate
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
      
      console.error('删除候选人错误:', err);
      res.status(500).send({
        code: 500,
        message: `删除候选人时发生错误 id: ${id}`
      });
      return;
    }

    res.json({
      code: 200,
      message: '候选人删除成功'
    });
  });
};