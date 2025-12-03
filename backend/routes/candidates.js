const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// 获取候选人列表
router.get('/', candidateController.getCandidates);

// 获取候选人详情
router.get('/:id', candidateController.getCandidateById);

// 创建候选人
router.post('/', candidateController.createCandidate);

// 更新候选人
router.put('/:id', candidateController.updateCandidate);

// 删除候选人
router.delete('/:id', candidateController.deleteCandidate);

module.exports = router;