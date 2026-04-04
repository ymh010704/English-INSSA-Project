import express from "express";
import path from "path";
import { fileURLToPath } from "url";
<<<<<<< Updated upstream
import routes from "./routes/index.js"; // 경로 확인 필요
=======
import routes from "./routes/index.js";
import slangRoutes from "./routes/slang.routes.js"; 
>>>>>>> Stashed changes
import { notFound } from "./middlewares/notfound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import adminRoutes from './routes/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
<<<<<<< Updated upstream

const app = express();

app.use(express.json());

// 빌드된 리액트 파일(dist) 폴더 연결
app.use(express.static(path.join(__dirname, "../../dist")));

// 헬스체크 및 API 라우트
=======
const distPath = path.join(__dirname, "../../dist");

const app = express();

// --- 로그 미들웨어 
app.use((req, res, next) => {
  console.log(`🌐 [REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

>>>>>>> Stashed changes
app.get("/health", (req, res) => res.json({ ok: true }));

<<<<<<< Updated upstream
// 그 외 모든 주소는 리액트 화면(index.html)으로 연결
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// 에러 핸들러
=======
app.use("/api", routes); 
app.use("/api/slangs", slangRoutes); 
app.use('/api/admin', adminRoutes);

// --- 정적 파일 및 클라이언트 사이드 라우팅 ---
app.use(express.static(distPath));

app.get("*", (req, res) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) res.status(404).send("Front-end build file not found.");
  });
});

// ---  에러 핸들링 ---
>>>>>>> Stashed changes
app.use(notFound);
app.use(errorHandler);

export { app };