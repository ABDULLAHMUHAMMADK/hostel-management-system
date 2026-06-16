import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WardenSidebar from "../components/WardenSidebar";

export default function WardenLayout() {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return null;
  }

  if (!user || user.role !== "warden") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
      
      {/* SIDEBAR WRAPPER */}
      <div className="h-full flex shrink-0">
        {/* Pass down the setter function so the sidebar can toggle the state from within */}
        <WardenSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN CONTENT AREA */}
      <main
        className="h-full overflow-y-auto px-10 py-10 relative z-10 transition-all duration-300 ease-in-out"
        style={{ flexGrow: 1 }}
      >
        <Outlet />
      </main>
    </div>
  );
}