import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LearningIntro from "./pages/LearningIntro";
import CardStudy from "./pages/CardStudy";
import Practice from "./pages/Practice";
import AiChat from "./pages/AiChat";
import Review from "./pages/Review";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import Bookmark from "./pages/Bookmark";
import Settings from "./pages/Settings";
import ConversationLearn from "./pages/ConversationLearn";
import Community from "./pages/Community";
import SlangList from './pages/SlangList';
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 레이아웃이 필요 없는 독립 페이지 (홈, 로그인, 관리자) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        {/* 2. 레이아웃(사이드바 등)이 필요한 학습 관련 페이지들 */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/learning-intro" element={<Layout><LearningIntro /></Layout>} />
        <Route path="/card-study" element={<Layout><CardStudy /></Layout>} />
        <Route path="/practice" element={<Layout><Practice /></Layout>} />
        <Route path="/ai-chat" element={<Layout><AiChat /></Layout>} />
        <Route path="/review" element={<Layout><Review /></Layout>} />
        <Route path="/progress" element={<Layout><Progress /></Layout>} />
        <Route path="/bookmark" element={<Layout><Bookmark /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/conversation" element={<Layout><ConversationLearn /></Layout>} />
        <Route path="/community" element={<Layout><Community /></Layout>} />
        <Route path="/slangs" element={<Layout><SlangList /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}