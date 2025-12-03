// config/database.js
const mysql = require('mysql2');

// 首先连接到MySQL服务器（不指定数据库）
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456'
});

// 连接到MySQL服务器
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server');
  
  // 创建数据库（如果不存在）
  connection.query('CREATE DATABASE IF NOT EXISTS recruitment_system', (err, results) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database "recruitment_system" is ready');
    
    // 选择数据库
    connection.changeUser({ database: 'recruitment_system' }, (err) => {
      if (err) {
        console.error('Error changing to recruitment_system database:', err);
        return;
      }
      console.log('Using database: recruitment_system');
      
      // 创建用户表（如果不存在）
      const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role ENUM('admin', 'hr', 'finance', 'interviewer') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createUserTable, (err, results) => {
        if (err) {
          console.error('Error creating users table:', err);
          return;
        }
        console.log('Users table is ready');
        
        // 插入默认用户（如果不存在）
        const insertDefaultUser = `
          INSERT IGNORE INTO users (id, username, password, name, role) 
          VALUES (1, 'admin', '$2b$10$rVHMO/JNdKYuPqknQ.f7ouJihwUMwOz/FDnBfVsNudPCvpg7yv.VK', '管理员', 'admin')
        `;
        
        connection.query(insertDefaultUser, (err, results) => {
          if (err) {
            console.error('Error inserting default user:', err);
            return;
          }
          console.log('Default user is ready');
        });
      });
      
      // 创建资金表（如果不存在）
      const createFundTable = `
        CREATE TABLE IF NOT EXISTS funds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          platform VARCHAR(100) NOT NULL,
          position VARCHAR(100),
          recharge_by INT,
          recharge_by_name VARCHAR(100),
          date DATE NOT NULL,
          status ENUM('unused', 'using', 'used', 'expired') NOT NULL DEFAULT 'unused',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recharge_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `;
      
      connection.query(createFundTable, (err, results) => {
        if (err) {
          console.error('Error creating funds table:', err);
          return;
        }
        console.log('Funds table is ready');
      });
      
      // 创建候选人表（如果不存在）
      const createCandidateTable = `
        CREATE TABLE IF NOT EXISTS candidates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fund_id INT,
          name VARCHAR(100) NOT NULL,
          position VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100),
          source VARCHAR(100),
          education VARCHAR(50),
          experience VARCHAR(50),
          expected_salary VARCHAR(50),
          resume_attachment VARCHAR(255),
          process ENUM('invite', 'first-interview', 'second-interview', 'offer', 'entry') NOT NULL DEFAULT 'invite',
          interview_status ENUM('pass', 'reject', 'pending') NULL,
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE SET NULL
        )
      `;
      
      connection.query(createCandidateTable, (err, results) => {
        if (err) {
          console.error('Error creating candidates table:', err);
          return;
        }
        console.log('Candidates table is ready');
      });
    });
  });
});

module.exports = connection;