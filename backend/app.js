const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 简单的路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎来到招聘管理系统API' });
});

// 用户认证路由
app.use('/api/auth', require('./routes/auth'));

// 资金管理路由
app.use('/api/funds', require('./routes/funds'));

// 候选人管理路由
app.use('/api/candidates', require('./routes/candidates'));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;