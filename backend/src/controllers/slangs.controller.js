import * as service from "../services/slangs.service.js";
import { ok } from "../utils/response.js";

export async function listSlangs(req, res, next) {
  try {
    const data = await service.list();
    return ok(res, data); 
  } catch (e) {
    next(e);
  }
}