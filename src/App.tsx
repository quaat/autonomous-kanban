import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AppShell from "./components/shell/AppShell";
import BoardPage from "./components/board/BoardPage";
import WorkflowPage from "./components/workflow/WorkflowPage";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine currentView based on actual path
  const currentView = location.pathname === "/workflow" ? "workflow" : "board";

  const handleViewChange = (view: "board" | "workflow") => {
    if (view === "board") {
      navigate("/");
    } else {
      navigate("/workflow");
    }
  };

  return (
    <AppShell 
      currentView={currentView} 
      onViewChange={handleViewChange}
      onSearch={setSearchQuery}
    >
      <Routes>
        <Route path="/" element={<BoardPage searchQuery={searchQuery} />} />
        <Route path="/workflow" element={<WorkflowPage />} />
        <Route path="*" element={<BoardPage searchQuery={searchQuery} />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
