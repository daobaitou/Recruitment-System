// config/database.js
const mysql = require('mysql2');

// 数据库连接配置
const config = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'recruitment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(config);

// 获取连接
const db = pool.promise();

// 初始化数据库
async function initializeDatabase() {
  try {
    console.log('Connected to MySQL server');
    
    // 创建数据库
    await db.query('CREATE DATABASE IF NOT EXISTS recruitment_system');
    console.log('Database "recruitment_system" is ready');
    
    // 使用数据库
    await db.query('USE recruitment_system');
    console.log('Using database: recruitment_system');
    
    // 创建用户表
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table is ready');
    
    // 创建资金表
    await db.query(`
      CREATE TABLE IF NOT EXISTS funds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        position VARCHAR(100),
        salary_range VARCHAR(50),
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        recharge_by INT,
        recharge_by_name VARCHAR(100),
        status ENUM('unused', 'using', 'used', 'expired') DEFAULT 'unused' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recharge_by) REFERENCES users(id)
      )
    `);
    console.log('Funds table is ready');
    
    // 创建候选人表
    await db.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        source VARCHAR(100),
        education VARCHAR(50),
        experience VARCHAR(50),
        expected_salary VARCHAR(50),
        process ENUM('invite', 'first-interview', 'second-interview', 'offer', 'entry') DEFAULT 'invite',
        status ENUM('pending', 'confirmed', 'completed', 'passed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interview_status ENUM('pending', 'unconfirmed', 'confirmed', 'completed', 'rejected') DEFAULT 'pending',
        fund_id INT,
        first_interview_date DATE,
        first_interview_time TIME,
        first_interview_location VARCHAR(255),
        first_interview_notes TEXT,
        second_interview_date DATE,
        second_interview_time TIME,
        second_interview_location VARCHAR(255),
        second_interview_notes TEXT,
        schedule_remarks TEXT,
        FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Candidates table is ready');
    
    // 创建面试表
    await db.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        round VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        interviewer VARCHAR(100),
        date DATE,
        time TIME,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        feedback TEXT,
        rating INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
      )
    `);
    console.log('Interviews table is ready');
    
    // 创建默认用户（如果不存在）
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      await db.query(
        'INSERT INTO users (name, username, password, email, phone) VALUES (?, ?, ?, ?, ?)',
        ['管理员', 'admin', '123456', 'admin@example.com', '13800138000']
      );
      console.log('Default admin user created');
    }
    
    console.log('Database initialization completed');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

module.exports = { db, initializeDatabase };
