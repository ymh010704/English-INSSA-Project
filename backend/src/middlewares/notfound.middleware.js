function notFound(req, res) {
  res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } });
}

module.exports = { notFound };