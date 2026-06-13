import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WardenSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard Overview", path: "/warden" },
    { label: "Rooms Inventory", path: "/warden/rooms" },
    { label: "Student Roster", path: "/warden/students" },
    { label: "Complaints & Tickets", path: "/warden/complaints" }
  ];

  return (
    <aside className="w-64 h-full bg-[#032323] flex flex-col justify-between p-4 shrink-0 z-20 select-none">
      <div className="space-y-6">
        
        {/* Sidebar Header Brand Identity */}
        <div className="px-3 py-4 border-b border-teal-950/40">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-400 font-bold border border-teal-500/30">
              H
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight block">HMS Portal</span>
              <span className="text-[11px] font-medium text-teal-400/60 block -mt-0.5">Warden Workspace</span>
            </div>
          </div>
          
          <div className="mt-4 px-1">
            <span className="text-[11px] text-teal-500/70 block uppercase font-bold tracking-widest">Welcome back,</span>
            <span className="text-xs font-semibold text-teal-200 block truncate">{user?.name || "Warden User"}</span>
          </div>
        </div>

        {/* Dynamic Navigation Menu links */}
        <nav className="flex flex-col space-y-1.5 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/warden"}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-xs font-bold tracking-wide rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#00a896] text-white shadow-lg shadow-[#00a896]/15 font-extrabold scale-[1.01]"
                    : "text-teal-100/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </div>

      {/* Bottom Layout Control Action items */}
      <div className="px-1 pt-4 border-t border-teal-950/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-xs font-bold tracking-wide text-rose-400/80 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all active:scale-[0.98]"
        >
          Sign Out System
        </button>
      </div>
    </aside>
  );
}