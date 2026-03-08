import mysql from 'mysql2/promise'; // require 대신 import 사용

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root1234',
  database: process.env.DB_NAME || 'slang_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 회원가입 (사용자 생성)
export async function create(email, hashedPassword, nickname) { // export 키워드 사용
  const sql = 'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)';
  // 오타 수정: hashedPathword -> hashedPassword
  const [result] = await pool.execute(sql, [email, hashedPassword, nickname]);
  return { id: result.insertId, email, nickname };
}

// 로그인 (이메일로 사용자 찾기)
export async function findByEmail(email) { // export 키워드 사용
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.execute(sql, [email]);
  return rows[0]; // 없으면 undefined
}