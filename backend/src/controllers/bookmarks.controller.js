import * as service from "../services/bookmarks.service.js"; // 확장자 .js 추가
import { ok } from "../utils/response.js"; // 확장자 .js 추가

export function createBookmark(req, res, next) {
  try { return ok(res, service.create(req)); } catch (e) { next(e); }
}

export function listBookmarks(req, res, next) {
  try { return ok(res, service.list(req)); } catch (e) { next(e); }
}

export function deleteBookmark(req, res, next) {
  try { return ok(res, service.remove(req)); } catch (e) { next(e); }
}