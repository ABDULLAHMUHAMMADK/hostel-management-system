import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminLayout() {
  const user = { role: "admin" };

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
      <AdminSidebar />

      <main
        className="h-full overflow-y-auto px-8 py-8 relative z-10"
        style={{ flexGrow: 1 }}
      >
        <Outlet />
      </main>
    </div>
  );
}
