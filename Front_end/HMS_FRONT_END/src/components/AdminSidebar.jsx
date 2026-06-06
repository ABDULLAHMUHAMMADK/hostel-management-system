import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("🔒 Logging user out of session memory channels...");
    navigate("/");
  };

  const navItems = [
    { name: "Overview", path: "/admin" },
    { name: "Manage Rooms", path: "/admin/rooms" }
  ];

  return (
    <aside className="w-64 h-full  bg-white border-r border-slate-200/80  flex flex-col justify-between p-6 shrink-0 z-20">
      
      <div className="space-y-8">
        <div className="flex items-center space-x-3 px-2">
          <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-600/20">
            H
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">HMS Admin</span>
        </div>

        <nav className="flex flex-col space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-700 shadow-sm shadow-teal-600/5"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-3 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50/60 transition-all active:scale-[0.98]"
      >
        Déconnexion
      </button>

    </aside>
  );
}