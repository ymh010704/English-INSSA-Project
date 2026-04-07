function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = status === 500 ? "Server error" : (err.message || "Error");
  res.status(status).json({ ok: false, error: { code, message } });
}

module.exports = { errorHandler };