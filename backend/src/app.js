import express from "express";
import cors from "cors"; 
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/notfound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프론트엔드 경로 설정 (필요에 따라 "../../dist" 또는 "../../../frontend" 선택)
const distPath = path.join(__dirname, "../../dist");

const app = express();

// --- 1. 전역 미들웨어 설정 (라우트보다 먼저 와야 함) ---
app.use(cors());
app.use(express.json()); // POST 요청의 body를 읽기 위해 필수!
app.use(express.urlencoded({ extended: true }));

// --- 2. API 및 헬스체크 라우트 ---
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

// --- 3. 정적 파일 및 클라이언트 사이드 라우팅 처리 ---

// 빌드된 파일들이 있는 폴더 연결
app.use(express.static(distPath));

// API(/api)로 시작하지 않는 모든 GET 요청은 리액트 index.html로 보냄
app.get("*", (req, res) => {
  // API 요청인데 여기까지 내려온 경우(404 API)는 HTML을 주지 않고 다음(notFound)으로 넘김
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      // index.html 조차 없을 때 (빌드가 안 되었을 때)
      res.status(404).send("Front-end build file (index.html) not found.");
    }
  });
});

// --- 4. 에러 핸들링 (가장 마지막) ---
app.use(notFound);
app.use(errorHandler);

export { app };