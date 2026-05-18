import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// 페이지 컴포넌트 임포트
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import LearningIntro from "./pages/LearningIntro";
import CardStudy from "./pages/CardStudy";
import Practice from "./pages/Practice";
import AiChat from "./pages/AiChat";
import Review from "./pages/Review";
import Progress from "./pages/Progress";
import Bookmark from "./pages/Bookmark";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import SlangList from "./pages/SlangList";
import Shorts from "./pages/Shorts";
import MyPage from "./pages/MyPage";
import BookmarkStudy from "./pages/BookmarkStudy";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* 관리자 페이지 */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/learning-intro" element={<Layout><LearningIntro /></Layout>} />
        <Route path="/card-study" element={<Layout><CardStudy /></Layout>} />
        <Route path="/practice" element={<Layout><Practice /></Layout>} />
        <Route path="/ai-chat" element={<Layout><AiChat /></Layout>} />
        <Route path="/review" element={<Layout><Review /></Layout>} />
        <Route path="/progress" element={<Layout><Progress /></Layout>} />
        <Route path="/bookmark" element={<Layout><Bookmark /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/community" element={<Layout><Community /></Layout>} />
        <Route path="/slangs" element={<Layout><SlangList /></Layout>} />
        <Route path="/shorts" element={<Layout><Shorts /></Layout>} />
        <Route path="/mypage" element={<Layout><MyPage /></Layout>} />
        <Route path="/bookmark-study" element={<Layout><BookmarkStudy /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}