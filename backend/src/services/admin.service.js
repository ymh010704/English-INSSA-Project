import { pool } from "../repositories/db.js";

export const getUsers = async () => {
  const [rows] = await pool.execute('SELECT * FROM users');
  return rows;
};

// 유저 삭제
export const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const [result] = await connection.execute(
      'DELETE FROM users WHERE user_id = ?',
      [id]
    );

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();

    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 슬랭 목록 조회
export const getSlangs = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM slangs ORDER BY created_at DESC'
  );
  return rows;
};

// 슬랭 추가
export const createSlang = async (data) => {
  const { word, definition_ko, definition_en, example_en, example_ko } = data;

  const [result] = await pool.execute(
    'INSERT INTO slangs (word, definition_ko, definition_en, example_en, example_ko) VALUES (?, ?, ?, ?, ?)',
    [word, definition_ko, definition_en, example_en, example_ko]
  );

  return result;
};

// 슬랭 삭제
export const deleteSlang = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM slangs WHERE slang_id = ?',
    [id]
  );
  return result;
};