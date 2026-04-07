function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

module.exports = { ok, fail };