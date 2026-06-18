import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  ClipboardList, 
  LogOut,
  ChevronLeft
} from "lucide-react"; 

export default function WardenSidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard Overview", path: "/warden", icon: <LayoutDashboard size={18} /> },
    { label: "Rooms Inventory", path: "/warden/rooms", icon: <BedDouble size={18} /> },
    { label: "Student Roster", path: "/warden/students", icon: <Users size={18} /> },
    { label: "Complaints & Tickets", path: "/warden/complaint", icon: <ClipboardList size={18} /> }
  ];

  return (
    <aside className={`h-full bg-[#032323] flex flex-col justify-between py-4 shrink-0 z-20 select-none transition-all duration-300 ${
      isCollapsed ? "w-16 px-2" : "w-64 p-4"
    }`}>
      <div className="space-y-6">
        
        {/* Sidebar Header Brand Identity */}
        <div className="py-4 border-b border-teal-950/40 px-1">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            
            {/* Logo and Brand Title Group */}
            <div className="flex items-center space-x-3">
              {/* BRAND LOGO: Clicking this when closed expands the sidebar */}
              <div 
                onClick={() => isCollapsed && setIsCollapsed(false)}
                className={`h-9 w-9 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-400 font-bold border border-teal-500/30 shrink-0 select-none ${
                  isCollapsed ? "cursor-pointer hover:bg-teal-400/30 hover:text-white transition-all transform active:scale-95" : ""
                }`}
                title={isCollapsed ? "Expand Sidebar" : ""}
              >
                H
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <span className="text-base font-black text-white tracking-tight block">HMS Portal</span>
                  <span className="text-[11px] font-medium text-teal-400/60 block -mt-0.5">Warden Workspace</span>
                </div>
              )}
            </div>

            {/* Embedded Inline Toggle Button - ONLY shows when open */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-teal-400/60 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}

          </div>
          
          {/* Welcome User Panel */}
          {!isCollapsed && (
            <div className="mt-4 px-1 animate-fade-in">
              <span className="text-[11px] text-teal-500/70 block uppercase font-bold tracking-widest">Welcome back,</span>
              <span className="text-xs font-semibold text-teal-200 block truncate">{user?.name || "Warden User"}</span>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Menu links */}
        <nav className="flex flex-col space-y-1.5 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/warden"}
              className={({ isActive }) =>
                `flex items-center py-3 text-xs font-bold tracking-wide rounded-xl transition-all duration-200 gap-3 ${
                  isCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-[#00a896] text-white shadow-lg shadow-[#00a896]/15 font-extrabold scale-[1.01]"
                    : "text-teal-100/60 hover:bg-white/5 hover:text-white"
                }`
              }
              title={isCollapsed ? item.label : ""}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

      </div>

      {/* Bottom Layout Control Action items */}
      <div className="px-1 pt-4 border-t border-teal-950/40">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center py-3 text-xs font-bold tracking-wide text-rose-400/80 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all active:scale-[0.98] gap-3 ${
            isCollapsed ? "justify-center px-0" : "px-4"
          }`}
          title={isCollapsed ? "Sign Out System" : ""}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Sign Out System</span>}
        </button>
      </div>
    </aside>
  );
}