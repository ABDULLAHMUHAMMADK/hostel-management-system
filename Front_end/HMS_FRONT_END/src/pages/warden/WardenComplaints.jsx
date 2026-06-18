import React, { useState, useEffect } from "react";
import API from "../../api/client";
import { 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  User, 
  Calendar,
  PieChart
} from "lucide-react";

// --- STRUCTURAL GRID SKELETON LOADER ---
function ComplaintPageSkeleton() {
  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 overflow-hidden p-4 animate-pulse select-none font-sans bg-slate-50/30">
      <div className="h-10 bg-slate-300 rounded-xl w-1/4" />
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
        {/* Left Side 40% Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3 h-28">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-2xl p-3 flex flex-col justify-between" style={cardShadowStyle}>
                <div className="h-2 w-10 bg-slate-300 rounded" />
                <div className="h-5 w-8 bg-slate-300 rounded mt-1" />
                <div className="h-2 w-12 bg-slate-300 rounded mt-2" />
              </div>
            ))}
          </div>
          {/* Bottom Big Chart Skeleton */}
          <div className="flex-grow bg-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center" style={cardShadowStyle}>
            <div className="w-20 h-20 rounded-full border-[7px] border-slate-300/60 flex items-center justify-center mb-3" />
            <div className="w-1/3 h-3 bg-slate-300 rounded" />
          </div>
        </div>

        {/* Right Side 60% Column */}
        <div className="lg:col-span-3 bg-slate-200 rounded-2xl p-4 space-y-4 flex flex-col overflow-hidden" style={cardShadowStyle}>
          <div className="h-9 bg-slate-300 rounded-xl w-full" />
          <div className="h-7 bg-slate-300 rounded-lg w-1/2" />
          <div className="flex-grow space-y-3 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-300/50 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN WARDEN WORKSPACE COMPONENT ---
export default function WardenComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("all"); 

  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  const fetchComplaints = async (showPulse = false) => {
    try {
      if (showPulse) setLoading(true);
      setError("");
      
      const response = await API.get("/complaint/get-complaint");
      if (response.data?.success) {
        setComplaints(response.data.data);
      }
    } catch (err) {
      console.error("Complaint Engine Error:", err);
      setError(err.response?.data?.message || "Failed to load hostel complaints roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(true);
  }, []);

  const handleResolve = async (complaintId) => {
    setActionLoadingId(complaintId);
    try {
      const response = await API.patch(`/complaint/resolve/${complaintId}`);
      if (response.data?.success) {
        setComplaints(prev => 
          prev.map(c => c._id === complaintId ? { ...c, status: "resolved" } : c)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not execute resolve routine.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === "pending").length;
  const resolvedCount = complaints.filter(c => c.status === "resolved").length;

  const resolvedPercentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resolvedPercentage / 100) * circumference;

  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filterState === "all" || complaint.status === filterState;
    const studentName = complaint.studentId?.name?.toLowerCase() || "";
    const complaintTitle = complaint.title?.toLowerCase() || "";
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || complaintTitle.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <ComplaintPageSkeleton />;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 select-none font-sans overflow-hidden p-4 bg-slate-50/20 animate-in fade-in duration-300">
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes strokeDraw {
          from { stroke-dashoffset: ${circumference}; }
          to { stroke-dashoffset: ${strokeDashoffset}; }
        }
        .animate-ring-draw { animation: strokeDraw 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}} />

      {/* HEADER ROW */}
      <div className="shrink-0 flex justify-between items-start px-1">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Grievance Workspace</h1>
          <p className="text-[10px] font-bold text-slate-400 -mt-0.5 tracking-wide">Live administrative overview and layout logs</p>
        </div>
        <button 
          onClick={() => fetchComplaints(true)}
          className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-500 shadow-sm"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* RE-ENGINEERED 40% / 60% ACCENT SYSTEM GRID */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        
        {/* LEFT COMPONENT COLUMN (40% WIDTH) */}
        <div className="lg:col-span-2 flex flex-col gap-4 shrink-0 min-h-0">
          
          {/* TOP GRID ROW: THE 3 METRIC BLOCKS */}
          <div className="grid grid-cols-3 gap-3 shrink-0 h-28">
            
            {/* TOTAL TRACKED CARD */}
            <div className="bg-white rounded-2xl p-3 flex flex-col justify-between relative pl-4 group transition-all duration-300 hover:shadow-2xl overflow-hidden" style={cardShadowStyle}>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] rounded-r-md bg-blue-500 transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Overview</span>
                <AlertCircle size={11} className="text-blue-500" />
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-blue-600 tracking-tight block leading-none">{totalCount}</span>
                <span className="text-[6px] font-bold uppercase text-slate-400 tracking-widest mt-0.5 block">Total Logs</span>
              </div>
              <div className="text-[7px] text-blue-500 font-black uppercase tracking-wider border-t border-slate-100 pt-1">
                Total Complaint
              </div>
            </div>

            {/* TOTAL PENDING CARD */}
            <div className="bg-white rounded-2xl p-3 flex flex-col justify-between relative pl-4 group transition-all duration-300 hover:shadow-2xl overflow-hidden" style={cardShadowStyle}>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] rounded-r-md bg-amber-500 transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Pending</span>
                <Clock size={11} className="text-amber-500" />
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-amber-600 tracking-tight block leading-none">{pendingCount}</span>
                <span className="text-[6px] font-bold uppercase text-slate-400 tracking-widest mt-0.5 block">Active Cases</span>
              </div>
              <div className="text-[7px] text-amber-500 font-black uppercase tracking-wider border-t border-slate-100 pt-1">
                Pending Ticket
              </div>
            </div>

            {/* TOTAL RESOLVED CARD */}
            <div className="bg-white rounded-2xl p-3 flex flex-col justify-between relative pl-4 group transition-all duration-300 hover:shadow-2xl overflow-hidden" style={cardShadowStyle}>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] rounded-r-md bg-emerald-500 transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Resolved</span>
                <CheckCircle size={11} className="text-emerald-500" />
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-emerald-600 tracking-tight block leading-none">{resolvedCount}</span>
                <span className="text-[6px] font-bold uppercase text-slate-400 tracking-widest mt-0.5 block">Closed Cases</span>
              </div>
              <div className="text-[7px] text-emerald-500 font-black uppercase tracking-wider border-t border-slate-100 pt-1">
                Resolved Ticket
              </div>
            </div>

          </div>

          {/* BOTTOM REGION: STANDALONE DATA DISTRIBUTION CHART CARD */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between items-center relative pl-6 group flex-grow transition-all duration-300 hover:shadow-2xl overflow-hidden" style={cardShadowStyle}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r-md bg-[#00A896] transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none" />
            
            <div className="w-full flex justify-between items-center shrink-0">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Resolution Efficiency Metrics</span>
              <PieChart size={13} className="text-[#00A896]" />
            </div>

            {/* Center Interactive SVG Ring Block */}
            <div className="relative flex items-center justify-center my-auto p-4">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#1E2538" strokeWidth="8.5" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  fill="transparent" 
                  stroke="#00A896" 
                  strokeWidth="8.5" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  className="animate-ring-draw"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-slate-800 tracking-tighter leading-none">{resolvedPercentage}%</span>
                <span className="text-[6px] font-bold uppercase text-slate-400 tracking-widest mt-0.5">FILLED</span>
              </div>
            </div>

            {/* Legend Mapping Indicator */}
            <div className="w-full flex justify-center gap-6 text-[8px] font-black uppercase tracking-wider text-slate-400 border-t border-slate-100 pt-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                <span className="text-slate-700">{resolvedCount} Solved Files</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E2538]" />
                <span className="text-slate-700">{pendingCount} Open Issues</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT COLUMN: COMPLAINTS DATA SHEET FEED (60% WIDTH) */}
        <div 
          className="lg:col-span-3 bg-white rounded-2xl flex flex-col overflow-hidden min-h-0 p-1 relative pl-6 group transition-all duration-300" 
          style={cardShadowStyle}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r-md bg-[#00A896] transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none" />

          {/* Operational Filter Header */}
          <div className="p-4 border-b border-slate-100 bg-white shrink-0 space-y-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search ticket logs by keywords or resident name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A896] transition-all"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>

            <div className="flex gap-2">
              {[
                { id: "all", label: "All Logs" },
                { id: "pending", label: "Pending Issues" },
                { id: "resolved", label: "Resolved Files" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterState(tab.id)}
                  className={`flex-1 py-1.5 px-3 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-[0.98] ${
                    filterState === tab.id 
                      ? "bg-slate-800 border-slate-800 text-white shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continuous Tracking List Stream */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50/60">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-center">
                ⚠️ {error}
              </div>
            )}

            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint, index) => (
                <div 
                  key={complaint._id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all hover:bg-white hover:border-slate-400 hover:shadow-xs animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        complaint.status === 'resolved' 
                          ? 'bg-teal-50 border border-teal-100 text-[#00A896]' 
                          : 'bg-slate-200 text-slate-700 font-black'
                      }`}>
                        {complaint.status}
                      </span>
                      <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">
                        {complaint.title}
                      </h3>
                    </div>
                    
                    <p className="text-[10px] text-slate-600 font-semibold tracking-normal leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Operational Controls & Footer Logs */}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-0.5 gap-2 flex-wrap">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[8px] font-bold text-slate-400">
                      <span className="flex items-center gap-1 uppercase text-slate-500">
                        <User size={10} /> {complaint.studentId?.name || "Unknown Resident"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      {complaint.status === "pending" ? (
                        <button
                          disabled={actionLoadingId === complaint._id}
                          onClick={() => handleResolve(complaint._id)}
                          className="px-3 py-1 bg-[#00A896] hover:bg-teal-700 disabled:opacity-50 text-white text-[8px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95"
                        >
                          {actionLoadingId === complaint._id ? "Saving..." : "Resolve"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5 text-[#00A896] text-[8px] font-black uppercase tracking-wider select-none">
                          <CheckCircle size={10} /> Solved
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No complaints match criteria</span>
              </div>
            )}
          </div>

          {/* Bottom Total Metabar */}
          <div className="p-2 border-t border-slate-100 bg-white shrink-0 text-[9px] font-black text-slate-400 uppercase tracking-wider">
            Total Records Tracked: {filteredComplaints.length} Shown
          </div>
        </div>

      </div>
    </div>
  );
}