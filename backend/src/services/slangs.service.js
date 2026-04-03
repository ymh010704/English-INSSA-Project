import { pool } from "../repositories/db.js";

export const list = async () => {
  // DB에서 모든 슬랭 데이터를 가져와서 반환합니다.
  const [rows] = await pool.query("SELECT * FROM slangs ORDER BY created_at DESC");
  return rows;
};