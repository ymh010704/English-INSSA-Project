const service = require("../services/words.service");
const { ok } = require("../utils/response");

function createWord(req, res, next) {
  try { return ok(res, service.create(req)); } catch (e) { next(e); }
}
function listWords(req, res, next) {
  try { return ok(res, service.list(req)); } catch (e) { next(e); }
}
function getWord(req, res, next) {
  try { return ok(res, service.get(req)); } catch (e) { next(e); }
}
function updateWord(req, res, next) {
  try { return ok(res, service.update(req)); } catch (e) { next(e); }
}
function deleteWord(req, res, next) {
  try { return ok(res, service.remove(req)); } catch (e) { next(e); }
}

module.exports = { createWord, listWords, getWord, updateWord, deleteWord };