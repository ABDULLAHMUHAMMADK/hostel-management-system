import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Key, AlertTriangle, CheckCircle, FileText, User } from "lucide-react";
import API from "../../api/client";
import { useAuth } from "../../context/AuthContext";

// Metric Card Component - Borders removed, keeping centered line expanding on hover
function StatCard({ label, value, sub }) {
  return (
    <div
      className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col justify-center h-24 select-none overflow-hidden transition-all duration-300 hover:bg-slate-50/50"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      }}
    >
      {/* Absolute Outer-Edge Line Accent - Centered initially, grows to full height */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />
      
      <div className="flex flex-col justify-center space-y-0.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          {label}
        </span>
        <span className="text-2xl font-black text-slate-800 tracking-tight block leading-tight">
          {value}
        </span>
        {sub && (
          <span className="text-[11px] font-bold text-slate-500 block truncate leading-tight pt-0.5">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function Skeleton({ className }) {
  return (
    <div className={`bg-slate-200 rounded-xl ${className}`} />
  );
}

export default function StudentOverview() {
  const { user } = useAuth();

  // 1. Structural States
  const [residentialData, setResidentialData] = useState(null);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 2. Network Hydration Engine
  const fetchStudentDashboardMatrix = async (showLoadingState = false) => {
    try {
      if (showLoadingState) setLoading(true);
      setErrorMessage("");

      console.log("🔄 Initiating network hydration pipeline...");
      const [residentialRes, feesRes, noticesRes, complaintsRes] = await Promise.all([
        API.get("/hostel/residential-data"),
        API.get("/fee/my-fees"),
        API.get("/notices/my-hostel"),
        API.get("/complaint/my-complaints"), 
      ]);

      if (residentialRes.data?.success) setResidentialData(residentialRes.data);
      if (feesRes.data?.success) setFees(feesRes.data.data);
      if (noticesRes.data?.success) setNotices(noticesRes.data.data);
      if (complaintsRes.data?.success) setComplaints(complaintsRes.data.data);

      console.log("✅ Student dashboard structural sync finalized.");
    } catch (err) {
      console.error("❌ Critical Dashboard engine failure caught:", err.message);
      setErrorMessage("Could not load data from server.");
    } finally {
      loading && setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboardMatrix(true);
  }, []);

  // 3. Real-Time Socket Stream
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
      { withCredentials: true }
    );

    const handleLiveStreamPing = () => {
      console.log("⚡ Live websocket ping synchronized!");
      fetchStudentDashboardMatrix(false); 
    };

    socket.on("room_allocation_updated", handleLiveStreamPing);
    socket.on("fee_ledger_updated", handleLiveStreamPing);
    socket.on("notice_published", handleLiveStreamPing);
    socket.on("complaint_status_changed", handleLiveStreamPing);

    return () => {
      socket.disconnect();
    };
  }, []);

  // 4. Fallback Computing & Data Parsing
  const safeFees = Array.isArray(fees) ? fees : [];
  const safeNotices = Array.isArray(notices) ? notices : [];
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // FIXED FILTER: Evaluates strictly against valid schema attributes from API responses
  const unpaidInvoices = safeFees.filter(
    (fee) => fee?.status === "unpaid" || fee?.status === "pending"
  );
  
  // Counts
  const totalComplaintsCount = safeComplaints.length;
  const resolvedComplaintsCount = safeComplaints.filter(c => c.status === "resolved").length;
  const totalNoticesCount = safeNotices.length;

  // Predictable step multiplier
  const totalComplaintsPercentage = Math.min(totalComplaintsCount * 15, 100);
  const resolvedPercentage = Math.min(resolvedComplaintsCount * 15, 100);
  const noticesPercentage = Math.min(totalNoticesCount * 15, 100); 

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-between space-y-6 p-2 bg-slate-50">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ flexGrow: 1 }}>
          <Skeleton className="h-full" />
          <Skeleton className="lg:col-span-2 h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col justify-between space-y-4 overflow-hidden pr-2 select-none p-1">
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal-600 uppercase">
            {residentialData?.hostelName || "HOSTEL SYSTEM"}
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Overview for <span className="font-extrabold text-slate-800 uppercase">Student Dashboard</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            CONNECTED
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-md shrink-0">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatCard
          label="Room Number"
          value={residentialData?.assigned ? `Room ${residentialData.roomNumber}` : "Not Assigned"}
          sub={residentialData?.roomType || "Standard Layout"}
        />
        <StatCard
          label="Room Status"
          value={residentialData?.isSpaceAvailable ? "Slots Available" : "Room Full"}
          sub={`Available beds: ${residentialData?.slotsLeft || 0}`}
        />
        <StatCard
          label="Unpaid Fees"
          value={`${unpaidInvoices.length} Due`}
          sub={unpaidInvoices.length > 0 ? "Needs payment" : "All clear"}
        />
        <StatCard
          label="Notices"
          value={`${safeNotices.length} Total`}
          sub="Hostel announcements"
        />
      </div>

      {/* SPLIT HUB SYSTEM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 pb-1" style={{ flexGrow: 1 }}>
        
        {/* LEFT PANEL: Overview Status Board - Borders completely removed */}
        <div
          className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col justify-between h-full min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          {/* Absolute Outer-Edge Line Accent */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

          <div className="w-full shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Overview Status
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Live updates of your profile records
            </p>
          </div>

          {/* Bar Chart List Container */}
          <div className="w-full space-y-5 my-auto py-2">
            
            {/* Row 1: Total Complaints */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wide">Total Complaints</span>
                <span className="text-xs font-black text-slate-800">{totalComplaintsCount}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${totalComplaintsPercentage}%` }}
                />
              </div>
            </div>

            {/* Row 2: Resolved Complaints */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wide">Resolved Issues</span>
                <span className="text-xs font-black text-emerald-600">{resolvedComplaintsCount}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${resolvedPercentage}%` }}
                />
              </div>
            </div>

            {/* Row 3: Total Notices */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wide">Total Notices</span>
                <span className="text-xs font-black text-slate-800">{totalNoticesCount}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${noticesPercentage}%` }}
                />
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-bold text-left tracking-wide shrink-0 pt-2">
            * Bars automatically balance from real-time events.
          </p>
        </div>

        {/* MIDDLE PANEL: Roommates & Complaints */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          
          {/* Roommates Card - Borders completely removed */}
          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col justify-center h-24 shrink-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50"
          >
            {/* Absolute Outer-Edge Line Accent */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Roommates
              </span>
              <div className="mt-1 space-y-0.5 overflow-hidden">
                {residentialData?.roommates && residentialData.roommates.length > 0 ? (
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {residentialData.roommates.join(", ")}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400 italic">
                    No roommates assigned.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Complaints List Board Card - Borders completely removed */}
          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px", flexGrow: 1 }}
            className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50"
          >
            {/* Absolute Outer-Edge Line Accent */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Complaints
              </h3>
              <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {safeComplaints.length} Total
              </span>
            </div>

            <div className="overflow-y-auto min-h-0 space-y-2 pr-1" style={{ flexGrow: 1 }}>
              {safeComplaints.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle size={20} className="text-slate-300 mb-1" />
                  <p className="text-[11px] font-bold text-center">No complaints found</p>
                </div>
              ) : (
                safeComplaints.map((c) => (
                  <div key={c._id} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{c.title}</p>
                      <p className="text-[10px] text-slate-400 truncate font-medium">{c.description}</p>
                    </div>
                    <span className={`shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      c.status === "resolved" 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Notice Board Card - Borders completely removed */}
        <div
          className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          {/* Absolute Outer-Edge Line Accent */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

          <div className="mb-3 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Notice Board
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Updates and alerts posted by your warden
            </p>
          </div>

          <div className="overflow-y-auto min-h-0 space-y-3 pr-1" style={{ flexGrow: 1 }}>
            {safeNotices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={24} className="text-slate-300 mb-1" />
                <p className="text-[11px] font-bold text-center">Notice board is empty</p>
              </div>
            ) : (
              safeNotices.map((notice) => (
                <div key={notice._id} className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      notice.category === "emergency" ? "bg-rose-50 text-rose-600" :
                      notice.category === "maintenance" ? "bg-blue-50 text-blue-600" :
                      notice.category === "mess" ? "bg-orange-50 text-orange-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {notice.category || "general"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">
                      {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight mt-0.5">{notice.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-3 leading-relaxed">{notice.description}</p>
                </div>
              )
            ))}
          </div>

          <div className="pt-2 shrink-0 flex justify-between items-center text-slate-400 text-[10px] font-bold">
            <span>
              ID: {user?._id ? user._id.slice(-6).toUpperCase() : "GUEST"}
            </span>
            <span className="text-teal-600 font-black hover:underline cursor-pointer tracking-wider uppercase">
              View All →
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}