import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Settings,
  ChevronLeft,
  UserCheck
} from "lucide-react";

export default function StudentSidebar({ isCollapsed, setIsCollapsed, closeMobile }) {
  const { user } = useAuth();

  // Helper to extract student profile initials exactly like the warden view
  const getInitials = () => {
    if (!user?.name) return "ST";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      label: "Dashboard Overview",
      path: "/student",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Notices & Complaints",
      path: "/student/support-hub", // Pointing directly to your newly created unified hub page
      icon: <Megaphone size={18} />,
    },
    {
      label: "Gate Pass System",
      path: "/student/passes",
      icon: <FileText size={18} />,
    },
    {
      label: "Profile Settings",
      path: "/student/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside
      className={`h-full bg-[#032323] flex flex-col justify-between py-4 shrink-0 z-20 select-none transition-all duration-300 ${
        isCollapsed ? "w-16 px-2" : "w-64 p-4"
      }`}
    >
      <div className="space-y-6">
        {/* Sidebar Header Brand Identity */}
        <div className="py-4 border-b border-teal-950/40 px-1">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            {/* Logo and Brand Title Group */}
            <div className="flex items-center space-x-3">
              <div
                onClick={() => isCollapsed && setIsCollapsed(false)}
                className={`h-9 w-9 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-400 font-bold border border-teal-500/30 shrink-0 select-none ${
                  isCollapsed
                    ? "cursor-pointer hover:bg-teal-400/30 hover:text-white transition-all transform active:scale-95"
                    : ""
                }`}
                title={isCollapsed ? "Expand Sidebar" : ""}
              >
                H
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <span className="text-base font-black text-white tracking-tight block">
                    HMS Portal
                  </span>
                  <span className="text-[11px] font-medium text-teal-400/60 block -mt-0.5">
                    Student Workspace
                  </span>
                </div>
              )}
            </div>

            {/* Inline Collapse Arrow Toggle Button */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-teal-400/60 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 hidden lg:flex"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Menu links */}
        <nav className="flex flex-col space-y-1.5 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/student"}
              onClick={closeMobile}
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

      {/* Modern SaaS Profile Target Footer */}
      <div className="px-1 pt-4 border-t border-teal-950/40">
        <NavLink
          to="/student/profile"
          onClick={closeMobile}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all duration-200 group border ${
              isCollapsed ? "justify-center px-0 border-transparent" : "px-3"
            } ${
              isActive
                ? "bg-white/10 border-teal-500/30 text-white"
                : "border-transparent text-teal-100/60 hover:bg-white/5 hover:text-white"
            }`
          }
          title={isCollapsed ? "Student Account Hub" : ""}
        >
          {/* Circular Avatar Badge */}
          <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 font-black text-xs flex items-center justify-center tracking-tight shrink-0 border border-teal-400/30 uppercase transition-all group-hover:bg-[#00a896] group-hover:text-white group-hover:border-transparent">
            {getInitials()}
          </div>

          {/* Account Identity Meta Labels */}
          {!isCollapsed && (
            <div className="flex-grow min-w-0 flex items-center justify-between gap-1">
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold tracking-tight truncate leading-tight text-teal-50">
                  {user?.name || "Student Profile"}
                </h4>
                <p className="text-[9px] font-bold text-teal-400/50 uppercase tracking-wider leading-none mt-0.5 group-hover:text-teal-400">
                  Resident Account
                </p>
              </div>
              <UserCheck size={14} className="text-teal-400/40 group-hover:text-teal-400 shrink-0 ml-auto" />
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}