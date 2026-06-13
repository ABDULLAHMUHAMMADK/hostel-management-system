import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WardenSidebar from "../components/WardenSidebar";

export default function WardenLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || user.role !== "warden") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
      <WardenSidebar />
      <main
        className=" h-full overflow-y-auto px-10 py-10 relative z-10"
        style={{ flexGrow: 1 }}
      >
        <Outlet />
      </main>
    </div>
  );
}
