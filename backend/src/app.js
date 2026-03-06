import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js"; // 경로 확인 필요
import { notFound } from "./middlewares/notfound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// 빌드된 리액트 파일(dist) 폴더 연결
app.use(express.static(path.join(__dirname, "../../dist")));

// 헬스체크 및 API 라우트
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

// 그 외 모든 주소는 리액트 화면(index.html)으로 연결
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// 에러 핸들러
app.use(notFound);
app.use(errorHandler);

export { app };