const express = require("express");
const routes = require("./routes");
const { notFound } = require("./middlewares/notfound.middleware");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

// 기본 헬스체크
app.get("/health", (req, res) => res.json({ ok: true }));

// /api 라우트
app.use("/api", routes);

// 404 / 에러 핸들러
app.use(notFound);
app.use(errorHandler);

module.exports = { app };