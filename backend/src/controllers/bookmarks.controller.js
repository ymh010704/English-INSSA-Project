const service = require("../services/bookmarks.service");
const { ok } = require("../utils/response");

function createBookmark(req, res, next) {
  try { return ok(res, service.create(req)); } catch (e) { next(e); }
}
function listBookmarks(req, res, next) {
  try { return ok(res, service.list(req)); } catch (e) { next(e); }
}
function deleteBookmark(req, res, next) {
  try { return ok(res, service.remove(req)); } catch (e) { next(e); }
}

module.exports = { createBookmark, listBookmarks, deleteBookmark };