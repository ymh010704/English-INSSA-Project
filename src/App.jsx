import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CardStudy from "./pages/Cardstudy";
import Practice from "./pages/Practice";
import AiChat from "./pages/AiChat";
import Review from "./pages/Review";
import Progress from "./pages/Progress";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card-study" element={<CardStudy />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}