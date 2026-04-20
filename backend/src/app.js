import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/notfound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import studiesRoutes from './routes/studies.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const distPath = path.join(__dirname, "../../dist");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);
app.use("/api/studies", studiesRoutes);
app.use("/api/dashboard", dashboardRouter);

// 빌드된 파일들이 있는 폴더 연결
app.use(express.static(distPath));

app.get("*", (req, res, next) => {

  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Front-end build file not found.");
    }
  });
});

app.use(notFound);
app.use(errorHandler);

//const PORT = 3000;
//app.listen(PORT, "0.0.0.0", () => {
//  console.log(`✅ 백엔드 서버가 ${PORT}번 포트에서 살아났어! 🚀`);
//});

export { app };