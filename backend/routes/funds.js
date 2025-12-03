const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

// 获取资金列表
router.get('/', fundController.getFunds);

// 获取资金详情
router.get('/:id', fundController.getFundById);

// 创建资金记录
router.post('/', fundController.createFund);

// 更新资金记录
router.put('/:id', fundController.updateFund);

// 删除资金记录
router.delete('/:id', fundController.deleteFund);

module.exports = router;