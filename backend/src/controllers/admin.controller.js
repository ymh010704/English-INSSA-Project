import * as AdminService from '../services/admin.service.js';

// 유저 목록 조회
export const getUsers = async (req, res) => {
  try {
    const users = await AdminService.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('유저 조회 에러:', err);
    res.status(500).json({ success: false, message: '유저 조회 실패' });
  }
};

// 유저 삭제
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await AdminService.deleteUser(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '유저 없음' });
    }

    res.json({ success: true, message: '유저 삭제 완료' });
  } catch (err) {
    console.error('삭제 에러:', err);
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
};

// 슬랭 목록 조회
export const getSlangs = async (req, res) => {
  try {
    const data = await AdminService.getSlangs();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: '조회 실패' });
  }
};

// 슬랭 등록
export const createSlang = async (req, res) => {
  try {
    const result = await AdminService.createSlang(req.body);

    res.status(201).json({
      success: true,
      slangId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '등록 실패' });
  }
};

// 슬랭 삭제
export const deleteSlang = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await AdminService.deleteSlang(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '슬랭 없음' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
};