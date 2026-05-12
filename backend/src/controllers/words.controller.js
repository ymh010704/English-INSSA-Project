import * as service from "../services/words.service.js"; // 확장자 .js 추가
import { ok } from "../utils/response.js"; // 확장자 .js 추가

export function createWord(req, res, next) {
  try { return ok(res, service.create(req)); } catch (e) { next(e); }
}

export function listWords(req, res, next) {
  try { return ok(res, service.list(req)); } catch (e) { next(e); }
}

export function getWord(req, res, next) {
  try { return ok(res, service.get(req)); } catch (e) { next(e); }
}

export function updateWord(req, res, next) {
  try { return ok(res, service.update(req)); } catch (e) { next(e); }
}

export function deleteWord(req, res, next) {
  try { return ok(res, service.remove(req)); } catch (e) { next(e); }
}