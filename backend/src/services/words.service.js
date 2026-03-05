const repo = require("../repositories/words.repo.memory");

function getUserId(req) {
  // 전시/개발용: 헤더로 유저 구분
  return req.header("X-User-Id") || "demo";
}

function create(req) {
  const userId = getUserId(req);
  const { term } = req.body || {};
  if (!term || String(term).trim().length === 0) {
    const err = new Error("term_required");
    err.status = 400;
    err.code = "TERM_REQUIRED";
    throw err;
  }
  return repo.create(userId, req.body);
}

function list(req) {
  const userId = getUserId(req);
  const { q, tag } = req.query || {};
  return repo.list(userId, { q, tag });
}

function get(req) {
  const userId = getUserId(req);
  const item = repo.get(userId, req.params.id);
  if (!item) {
    const err = new Error("not_found");
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return item;
}

function update(req) {
  const userId = getUserId(req);
  const item = repo.update(userId, req.params.id, req.body || {});
  if (!item) {
    const err = new Error("not_found");
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return item;
}

function remove(req) {
  const userId = getUserId(req);
  const ok = repo.remove(userId, req.params.id);
  if (!ok) {
    const err = new Error("not_found");
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return true;
}

module.exports = { create, list, get, update, remove };