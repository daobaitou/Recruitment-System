const express = require('express');
const router = express.Router();

// 简单的路由示例
router.get('/', (req, res) => {
  res.json({ message: 'Jobs API' });
});

module.exports = router;