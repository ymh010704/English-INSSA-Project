// backend/src/repositories/users.repo.mysql.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 회원가입 (사용자 생성)
async function create(email, hashedPathword, nickname) {
  const sql = 'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)';
  const [result] = await pool.execute(sql, [email, hashedPathword, nickname]);
  return { id: result.insertId, email, nickname };
}

// 로그인 (이메일로 사용자 찾기)
async function findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.execute(sql, [email]);
  return rows[0]; // 없으면 undefined
}

module.exports = { create, findByEmail };