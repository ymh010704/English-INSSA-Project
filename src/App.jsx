import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card-study" element={<CardStudy />} />
        <Route path="/learning-intro" element={<LearningIntro />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookmark" element={<Bookmark />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/conversation" element={<ConversationLearn />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </BrowserRouter>
  );
}