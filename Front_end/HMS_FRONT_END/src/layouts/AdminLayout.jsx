import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return null;
  }

  // Enforce rigid fallback privilege gates for admin credentials
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative font-sans text-slate-800">
      
      {/* DESKTOP SIDEBAR VIEWPORT LAYER */}
      <div className="h-full hidden lg:flex shrink-0">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MOBILE BREAKPOINT SLIDE-DRAWER SYSTEM (For sizes < 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Translucent Backdrop Mask */}
          <div 
            className="fixed inset-0 bg-[#032323]/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          {/* Animated Sidebar Housing Drawer */}
          <div className="relative h-full flex flex-col max-w-[280px] shadow-2xl z-50">
            <AdminSidebar 
              isCollapsed={false} 
              setIsCollapsed={() => {}} 
              closeMobile={() => setMobileOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* RESPONSIVE SUB-WINDOW APP FRAME */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* ACTION HEADER BAR FOR MOBILE NAVIGATION TARGETS */}
        <header className="w-full h-14 bg-white border-b border-slate-200/60 px-4 md:px-6 flex items-center justify-between shrink-0 lg:hidden z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-[#032323] bg-slate-100 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-[#032323]">
              HMS Terminal
            </span>
          </div>
          
          <div className="text-[10px] font-black px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full uppercase tracking-wider">
            Warden Core
          </div>
        </header>

        {/* CORE APP WORKING WINDOW VIEWPORT */}
        <main
          className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 lg:p-10 relative z-10 transition-all duration-300 ease-in-out"
        >
          <Outlet />
        </main>
      </div>

    </div>
  );
}