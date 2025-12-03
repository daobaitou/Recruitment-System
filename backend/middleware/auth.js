const jwt = require('jsonwebtoken');

// 认证中间件
const authenticate = (req, res, next) => {
  // 获取token
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证token'
    });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruitment-system-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'token无效或已过期'
    });
  }
};

module.exports = authenticate;