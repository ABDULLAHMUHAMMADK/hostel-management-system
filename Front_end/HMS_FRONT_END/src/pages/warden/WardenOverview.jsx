import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { io } from "socket.io-client";

// ─── Single Left-Side Center-Expanding Dynamic Border Engine (25% -> 100%) ───
function AnimatedBorder({ accent }) {
  return (
    /* Left Edge Border Only */
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[25%] group-hover:h-full transition-all duration-300 ease-in-out z-20 rounded-r"
      style={{ backgroundColor: accent }}
    />
  );
}

// ─── Ultra Clean Card Component with Left-Side Hover Accent ───────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div 
      className="bg-white rounded-2xl p-4 flex flex-col justify-center h-24 select-none overflow-hidden relative group"
      style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
    >
      <AnimatedBorder accent={accent} />
      <div className="flex flex-col justify-center space-y-0.5 px-2 z-10">
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
  return <div className={`animate-pulse bg-slate-300/80 rounded-xl ${className}`} />;
}

export default function WardenOverview() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [feeStats, setFeeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async (showLoadingState = false) => {
    try {
      if (showLoadingState) setLoading(true);
      setError("");
      
      const [analyticsRes, complaintsRes, feeRes] = await Promise.all([
        API.get("/hostel/analytics"),
        API.get("/complaint/get-complaint"),
        API.get("/fee/fee-stats"),
      ]);
      
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.analytics);
      if (complaintsRes.data?.success) setComplaints(complaintsRes.data.data);
      if (feeRes.data?.success) setFeeStats(feeRes.data.stats);
    } catch (err) {
      console.error("Dashboard engine hydration failure:", err);
      setError("Could not load structural data analytics from server node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true
    });

    const handleLiveStreamPing = () => {
      console.log("⚡ Live update ping synchronized across system dashboards!");
      fetchDashboardData(false);
    };

    socket.on("analytics_updated", handleLiveStreamPing);
    socket.on("room_layout_changed", handleLiveStreamPing);

    return () => {
      socket.disconnect();
    };
  }, []);

  // ─── Using the new analytics structure ─────────────────────────────────────
  
  const totalStudents = analytics?.totalStudents ?? 0;
  const assignedStudents = analytics?.assignedStudents ?? 0;
  const unassignedStudents = analytics?.unassignedStudents ?? 0;
  
  const totalBedsCalculated = analytics?.totalBeds ?? 0;
  const occupiedBedsCalculated = analytics?.occupiedBeds ?? 0;
  const availableBedsCalculated = analytics?.availableBeds ?? 0;
  
  const totalRooms = analytics?.totalRooms ?? 0;
  const usedRooms = analytics?.usedRooms ?? 0;
  const fullyOccupiedRooms = analytics?.fullyOccupiedRooms ?? 0;
  const availableRooms = analytics?.availableRooms ?? 0;

  // ─── Pie chart data ──────────────────────────────────────────────────────────
  const occupancyPie = [
    { name: "Occupied Beds", value: occupiedBedsCalculated },
    { name: "Available Beds", value: availableBedsCalculated },
  ];

  const feePaid = feeStats.find((s) => s._id === "paid");
  const feePending = feeStats.find((s) => s._id === "pending");
  const totalInvoicedCount = (feePaid?.count || 0) + (feePending?.count || 0);

  const PIE_COLORS = ["#00a896", "#1e293b"];
  const pendingComplaints = complaints.filter((c) => c.status !== "resolved");

  const calculatedOccupancyRate = totalBedsCalculated > 0 
    ? `${Math.round((occupiedBedsCalculated / totalBedsCalculated) * 100)}%`
    : "0%";

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-between space-y-6 p-2 bg-slate-50">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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
      
      {/* ─── Header Section Area ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#00a896] uppercase">
            {analytics?.hostelName || "System Campus"}
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Real-time status indicators for{" "}
            <span className="font-extrabold text-slate-800 uppercase">
              Warden Overview
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-100 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            <span className="text-emerald-600">{analytics?.status || "Active"}</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl shadow-md shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* ─── Row 1: Strict 4-Card Premium Layout Line ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* ✅ Card 1: Total Residents with unassigned and total students */}
        <StatCard
          label="Total Residents"
          value={assignedStudents}
          sub={`${unassignedStudents} unassigned · ${totalStudents} total students`}
          accent="#8b5cf6"
        />
        
        {/* ✅ Card 2: Available Beds */}
        <StatCard
          label="Available Beds"
          value={availableBedsCalculated}
          sub={`${occupiedBedsCalculated} occupied of ${totalBedsCalculated} total`}
          accent="#3b82f6"
        />
        
        {/* ✅ Card 3: Pending Invoices */}
        <StatCard
          label="Pending Invoices"
          value={`${feePending?.count ?? 0} / ${totalInvoicedCount}`}
          sub="Outstanding balance sheets"
          accent="#f43f5e"
        />
        
        {/* ✅ Card 4: Total Rooms (UPDATED) */}
        <StatCard
          label="Total Rooms"
          value={totalRooms}
          sub={`${usedRooms} used · ${availableRooms} empty · ${fullyOccupiedRooms} full`}
          accent="#eab308"
        />
      </div>

      {/* ─── Row 2: Balanced 3-Column Split Content Grid Layout ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 pb-1" style={{ flexGrow: 1 }}>
        
        {/* LEFT PANEL: Occupancy Ratio Donut Ring Chart */}
        <div 
          className="bg-white rounded-2xl p-4 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden group"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <AnimatedBorder accent="#00a896" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start w-full px-2 z-10">
            Bed Occupancy Ratio
          </h3>
          <div className="relative w-full flex items-center justify-center min-h-0 py-2 z-10" style={{ flexGrow: 1 }}>
            {totalBedsCalculated > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyPie}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {occupancyPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800 tracking-tight">
                {calculatedOccupancyRate}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Filled</span>
            </div>
          </div>
          
          {/* Quick stats below chart */}
          <div className="w-full flex justify-between text-[9px] font-bold text-slate-500 px-2 pt-1 shrink-0 z-10 border-t border-slate-100/50 mt-1">
            <span>👥 {assignedStudents} Residents</span>
            <span>🛏️ {availableBedsCalculated} Beds Free</span>
            <span>📋 {totalStudents} Total</span>
          </div>
        </div>

        {/* MIDDLE PANEL: Dynamic Room Sub-Metrics & Complaints Feed ──── */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          
          <div className="grid grid-cols-2 gap-4 shrink-0">
            {/* Used Rooms Card */}
            <div 
              className="bg-white rounded-2xl p-4 flex flex-col justify-center h-24 select-none overflow-hidden relative group"
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            >
              <AnimatedBorder accent="#6366f1" />
              <div className="flex flex-col justify-center space-y-0.5 px-2 z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Used Rooms
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block leading-tight">
                  {usedRooms}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block truncate leading-tight pt-0.5">
                  Out of {totalRooms} rooms
                </span>
              </div>
            </div>

            {/* Fully Occupied Rooms Card */}
            <div 
              className="bg-white rounded-2xl p-4 flex flex-col justify-center h-24 select-none overflow-hidden relative group"
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            >
              <AnimatedBorder accent="#00a896" />
              <div className="flex flex-col justify-center space-y-0.5 px-2 z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Fully Occupied
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block leading-tight">
                  {fullyOccupiedRooms}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block truncate leading-tight pt-0.5">
                  {availableRooms} entirely empty
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Half: Complaints Ticket Feed */}
          <div 
            className="bg-white rounded-2xl p-4 flex flex-col min-h-0 relative overflow-hidden group"  
            style={{flexGrow: 1, boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          >
            <AnimatedBorder accent="#3b82f6" />
            <div className="flex items-center justify-between mb-2 shrink-0 px-2 z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Complaints
              </h3>
              <button
                onClick={() => navigate("/warden/complaints")}
                className="text-[9px] font-black uppercase text-[#00a896] hover:underline"
              >
                Feed →
              </button>
            </div>

            <div className="overflow-y-auto min-h-0 space-y-2 pr-1 px-2 z-10" style={{ flexGrow: 1 }}>
              {complaints.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[11px] text-slate-400 font-bold text-center">Clear tickets 🎉</p>
                </div>
              ) : (
                complaints.slice(0, 3).map((c) => (
                  <div key={c._id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 transition-all hover:bg-slate-100/50">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{c.studentId?.name || "Student"}</p>
                      <p className="text-[10px] text-slate-400 truncate font-medium">{c.title}</p>
                    </div>
                    <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Action Center Panel */}
        <div 
          className="bg-white rounded-2xl p-4 flex flex-col h-full min-h-0 relative overflow-hidden group"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <AnimatedBorder accent="#475569" />
          <div className="mb-3 shrink-0 px-2 z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Actions Needed
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Urgent administrative tasks requiring warden review
            </p>
          </div>

          <div className="overflow-y-auto min-h-0 space-y-2.5 pr-1 px-2 z-10" style={{ flexGrow: 1 }}>
            {pendingComplaints.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-rose-900 truncate">Unresolved Hostel Tickets</h4>
                  <p className="text-[10px] font-semibold text-rose-500 mt-0.5 line-clamp-2 leading-tight">
                    There are {pendingComplaints.length} pending tickets awaiting resolution.
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/warden/complaints")}
                  className="shrink-0 px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm hover:bg-rose-700 transition-colors"
                >
                  Resolve
                </button>
              </div>
            )}

            {feePending?.count > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-900 truncate">Pending Fee Overdues</h4>
                  <p className="text-[10px] font-semibold text-amber-600 mt-0.5 line-clamp-2 leading-tight">
                    {feePending.count} students have outstanding invoice balances.
                  </p>
                </div>
                <button className="shrink-0 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm hover:bg-amber-600 transition-colors">
                  Notify
                </button>
              </div>
            )}

            {/* Unassigned Students Action */}
            {unassignedStudents > 0 && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-indigo-900 truncate">Unassigned Students</h4>
                  <p className="text-[10px] font-semibold text-indigo-500 mt-0.5 line-clamp-2 leading-tight">
                    {unassignedStudents} students need room allocation.
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/warden/students")}
                  className="shrink-0 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Assign
                </button>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-700 truncate">Room Allocation Logs</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                  Review room mapping indices and resident ledger profiles.
                </p>
              </div>
              <button 
                onClick={() => navigate("/warden/rooms")}
                className="shrink-0 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm hover:bg-slate-900 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}