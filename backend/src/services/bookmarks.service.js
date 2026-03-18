import * as repo from "../repositories/bookmarks.repo.memory.js";

function getUserId(req) {
  return req.header("X-User-Id") || "demo";
}

export function create(req) { // export 추가
  const userId = getUserId(req);
  const { url } = req.body || {};
  if (!url || String(url).trim().length === 0) {
    const err = new Error("url_required");
    err.status = 400;
    err.code = "URL_REQUIRED";
    throw err;
  }
  return repo.create(userId, req.body);
}

export function list(req) { // export 추가
  const userId = getUserId(req);
  const { q, tag } = req.query || {};
  return repo.list(userId, { q, tag });
}

export function remove(req) { // export 추가
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