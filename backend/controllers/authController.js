const jwt = require('jsonwebtoken');

// 模拟用户数据（实际项目中应该存储在数据库中）
const users = {
  admin: {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    roles: ['admin']
  },
  hr: {
    id: 2,
    username: 'hr',
    name: '人事专员',
    email: 'hr@example.com',
    phone: '13800138001',
    roles: ['hr']
  },
  finance: {
    id: 3,
    username: 'finance',
    name: '财务专员',
    email: 'finance@example.com',
    phone: '13800138002',
    roles: ['finance']
  },
  interviewer: {
    id: 4,
    username: 'interviewer',
    name: '面试官',
    email: 'interviewer@example.com',
    phone: '13800138003',
    roles: ['interviewer']
  }
};

// 用户登录
exports.login = (req, res) => {
  const { username, password } = req.body;
  
  // 简单验证（实际项目中应该查询数据库）
  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空'
    });
  }
  
  // 检查用户是否存在
  if (!users[username]) {
    return res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    });
  }
  
  const user = users[username];
  
  // 生成JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      roles: user.roles 
    },
    process.env.JWT_SECRET || 'recruitment-system-secret',
    { expiresIn: '24h' }
  );
  
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      userInfo: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles
      }
    }
  });
};

// 用户登出
exports.logout = (req, res) => {
  res.json({
    code: 200,
    message: '登出成功'
  });
};

// 获取用户信息
exports.getUserInfo = (req, res) => {
  // 从token中解析用户信息
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证token'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruitment-system-secret');
    
    // 获取用户信息
    const user = users[decoded.username];
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: 'token无效或已过期'
    });
  }
};

// 获取用户列表
exports.getUsers = (req, res) => {
  try {
    // 将用户对象转换为数组格式
    const userList = Object.values(users).map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      roles: user.roles
    }));
    
    res.json({
      code: 200,
      message: '获取用户列表成功',
      data: userList
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败'
    });
  }
};

// 更新用户信息
exports.updateUserInfo = (req, res) => {
  // 从token中解析用户信息
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证token'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruitment-system-secret');
    
    // 获取用户信息
    const user = users[decoded.username];
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    // 更新用户信息
    const { name, email, phone } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    res.json({
      code: 200,
      message: '更新用户信息成功',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: 'token无效或已过期'
    });
  }
};