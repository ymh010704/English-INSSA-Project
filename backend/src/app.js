import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js"; 
import authRoutes from "./routes/auth.routes.js"; 

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
    res.json({ ok: true, message: "백엔드 엔진 가동 중! 🚀" });
});

app.use("/api/auth", authRoutes); 

app.use("/api/admin", adminRoutes);

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ 백엔드 서버가 ${PORT}번 포트에서 살아났어!`);
});