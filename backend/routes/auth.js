const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// 用户登录
router.post('/login', authController.login);

// 用户登出
router.post('/logout', authController.logout);

// 获取用户信息
router.get('/userinfo', authenticate, authController.getUserInfo);

// 获取用户列表
router.get('/users', authenticate, authController.getUsers);

// 更新用户信息
router.put('/userinfo', authenticate, authController.updateUserInfo);

module.exports = router;