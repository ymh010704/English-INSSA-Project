import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import useBreakpoint from "../hooks/useBreakpoint";

export default function Layout({ children }) {
  const { isMobile } = useBreakpoint();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {!isMobile && <Sidebar />}
        <div style={{
          flex: 1,
          overflowY: "auto",
          background: "#f3f4f6",
          paddingBottom: isMobile ? 60 : 0,
        }}>
          {children}
        </div>
      </div>
      {isMobile && <BottomNav />}
    </>
  );
}
