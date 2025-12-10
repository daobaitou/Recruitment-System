const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// 创建面试记录
router.post('/', interviewController.createInterview);

// 获取所有面试记录
router.get('/', interviewController.getAllInterviews);

// 根据ID获取面试记录
router.get('/:id', interviewController.getInterviewById);

// 根据候选人ID获取面试记录
router.get('/candidate/:candidateId', interviewController.getInterviewsByCandidateId);

// 更新面试记录
router.put('/:id', interviewController.updateInterview);

// 删除面试记录
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;