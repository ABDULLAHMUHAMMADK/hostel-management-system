import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { FileText, CheckCircle, PlusCircle, History, Send, BarChart3, Clock, Layers } from "lucide-react";
import API from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function StudentSupportHub() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("view");
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "maintenance",
    description: "",
  });

  const refreshHubMatrix = async (showLoadingState = false) => {
    try {
      if (showLoadingState) setLoading(true);
      setErrorMessage("");

      const [noticesRes, complaintsRes] = await Promise.all([
        API.get("/notices/my-hostel"),
        API.get("/complaint/my-complaints"),
      ]);

      if (noticesRes.data?.success) setNotices(noticesRes.data.data);
      if (complaintsRes.data?.success) setComplaints(complaintsRes.data.data);
    } catch (err) {
      console.error("❌ Support Hub pipeline extraction failed:", err.message);
      setErrorMessage("Could not load data from the structural layer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHubMatrix(true);
  }, []);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
      { withCredentials: true }
    );

    const handleStreamPing = () => {
      refreshHubMatrix(false);
    };

    socket.on("notice_published", handleStreamPing);
    socket.on("complaint_status_changed", handleStreamPing);

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Please fill out all fields before committing.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await API.post("/complaint/create-complaint", formData);

      if (res.data?.success) {
        setSuccessMessage("Complaint registered successfully into the admin logs!");
        setFormData({ title: "", category: "maintenance", description: "" });
        setActiveTab("view");
        refreshHubMatrix(false);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Internal failure handling your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const safeNotices = Array.isArray(notices) ? notices : [];
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // Metrics parsed into numerical values instead of percentage quotients
  const totalComplaints = safeComplaints.length;
  const resolvedComplaints = safeComplaints.filter(c => c.status === "resolved").length;
  const pendingComplaints = totalComplaints - resolvedComplaints;

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col justify-between space-y-4 overflow-hidden pr-2 p-1 bg-slate-50 animate-pulse">
        
        {/* Skeleton Header Layout */}
        <div className="flex items-start justify-between shrink-0">
          <div className="space-y-2 w-1/3">
            <div className="h-7 bg-slate-200 rounded" />
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          </div>
          <div className="h-7 bg-slate-200 rounded-xl w-32 shrink-0" />
        </div>

        {/* Skeleton Structural Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 pb-1" style={{ flexGrow: 1 }}>
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
            {/* Metrics Skeleton Card */}
            <div className="bg-white rounded-2xl p-4 pl-5 space-y-4 shrink-0 shadow-[0_5px_15px_rgba(0,0,0,0.35)] relative overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r bg-slate-200" />
              <div className="h-4 bg-slate-200 rounded w-1/3 border-b border-slate-100 pb-2" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                    <div className="h-2 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notices Panel Skeleton Card */}
            <div className="bg-white rounded-2xl p-4 pl-5 flex flex-col min-h-0 flex-1 shadow-[0_5px_15px_rgba(0,0,0,0.35)] relative overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r bg-slate-200" />
              <div className="flex justify-between items-center mb-4">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded-full w-16" />
              </div>
              <div className="space-y-3 overflow-hidden flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3.5 bg-slate-200 rounded w-12" />
                      <div className="h-2.5 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Workspace Skeleton Card */}
          <div className="bg-white rounded-2xl p-4 pl-5 flex flex-col h-full min-h-0 lg:col-span-8 shadow-[0_5px_15px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r bg-slate-200" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="space-y-1.5 w-1/2">
                <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                <div className="h-2.5 bg-slate-200 rounded w-3/4" />
              </div>
              <div className="h-7 bg-slate-200 rounded-xl w-48" />
            </div>
            <div className="space-y-3 overflow-hidden flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-200 rounded w-12" />
                  </div>
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col justify-between space-y-4 overflow-hidden pr-2 select-none p-1">
      
      {/* HEADER MATRIX SECTION */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal-600 uppercase">
            Notices & Complaints Hub
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Support center operations for <span className="font-extrabold text-slate-800 uppercase">Student Workspace</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            OPERATIONAL FEED
          </span>
        </div>
      </div>

      {/* ERROR/SUCCESS SYSTEM TOAST BAR */}
      {(errorMessage || successMessage) && (
        <div className="shrink-0 space-y-2">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-md">
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl shadow-md">
              🎉 {successMessage}
            </div>
          )}
        </div>
      )}

      {/* CORE SPLIT WORKSPACE INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 pb-1" style={{ flexGrow: 1 }}>
        
        {/* LEFT COLUMN: ANALYTICS CHART & OFFICIAL NOTICES (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          
          {/* UPDATED NUMERICAL METRICS CARD */}
          <div
            className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:bg-slate-50/50 shrink-0"
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-teal-500" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 size={14} className="text-teal-600" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Grievance Ratios
                </h3>
              </div>
            </div>

            <div className="space-y-3 py-1">
              {/* Line 1: Total Complaints */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  <span className="flex items-center gap-1"><Layers size={10} className="text-indigo-500" /> Total Complaints</span>
                  <span className="font-black text-slate-800">{totalComplaints} Tickets</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: totalComplaints > 0 ? "100%" : "0%" }} />
                </div>
              </div>

              {/* Line 2: Resolved */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500" /> Resolved Rate</span>
                  <span className="font-black text-slate-800">{resolvedComplaints} Tickets</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: totalComplaints > 0 ? `${(resolvedComplaints / totalComplaints) * 100}%` : "0%" }} />
                </div>
              </div>

              {/* Line 3: Pending */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  <span className="flex items-center gap-1"><Clock size={10} className="text-amber-500" /> Pending Review</span>
                  <span className="font-black text-slate-800">{pendingComplaints} Tickets</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: totalComplaints > 0 ? `${(pendingComplaints / totalComplaints) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* NOTICES LIST PANEL */}
          <div
            className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50 flex-1"
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-amber-500" />

            <div className="mb-3 shrink-0 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Notice Board Matrix
                </h3>
              </div>
              <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {safeNotices.length} Bulletins
              </span>
            </div>

            <div className="overflow-y-auto min-h-0 space-y-3 pr-1 flex-1">
              {safeNotices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <FileText size={24} className="text-slate-300 mb-1" />
                  <p className="text-[11px] font-bold text-center">Notice stream is quiet</p>
                </div>
              ) : (
                safeNotices.map((notice) => (
                  <div key={notice._id} className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1.5 transition-colors duration-200 hover:bg-slate-100/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        notice.category === "emergency" ? "bg-rose-50 text-rose-600" :
                        notice.category === "maintenance" ? "bg-blue-50 text-blue-600" :
                        notice.category === "mess" ? "bg-orange-50 text-orange-600" :
                        "bg-slate-200 text-slate-600"
                      }`}>
                        {notice.category || "general"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{notice.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{notice.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE HUB AND CREATION FORM (8 Columns) */}
        <div
          className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50 lg:col-span-8"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

          {/* Dynamic Tab Switchers */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Complaints Workspace
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                File grievances or track current infrastructure issues
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("view")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "view" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <History size={12} />
                Track Ledger ({safeComplaints.length})
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "create" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <PlusCircle size={12} />
                File Ticket
              </button>
            </div>
          </div>

          {/* VIEW WORKSPACE */}
          {activeTab === "view" && (
            <div className="overflow-y-auto min-h-0 space-y-2.5 pr-1 flex-1">
              {safeComplaints.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <CheckCircle size={28} className="text-emerald-400 mb-1.5" />
                  <p className="text-[11px] font-bold text-center">Your history sheet is pristine</p>
                </div>
              ) : (
                safeComplaints.map((c) => (
                  <div key={c._id} className="p-3 rounded-xl bg-slate-50 flex items-start justify-between gap-3 transition-colors duration-200 hover:bg-slate-100/50">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase bg-slate-200 px-1.5 py-0.2 rounded text-slate-500">
                          {c.category || "General"}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{c.description}</p>
                    </div>

                    <span className={`shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                      c.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* UI/UX PERFECTED COMPLAINT FORM PANEL */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateComplaint} className="flex-1 flex flex-col justify-between min-h-0 pr-1">
              <div className="space-y-5 overflow-y-auto min-h-0 pb-4 pt-1 px-1">
                
                {/* Field 1: Title Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Defect Title / Subject Summary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter short, clear subject line..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all duration-150"
                  />
                </div>

                {/* Field 2: Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    System Department Classification
                  </label>
                  <div className="relative w-full max-w-md">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold text-slate-700 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all duration-150 appearance-none cursor-pointer"
                    >
                      <option value="maintenance">🔧 Civil & Electrical Maintenance</option>
                      <option value="mess">🍽️ Hostel Mess & Catering Services</option>
                      <option value="clean">🧹 Sanitation & Structural Cleaning</option>
                      <option value="security">🛡️ Compound Security Operations</option>
                      <option value="other">📦 General Miscellaneous / Other Issues</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 text-[9px] font-bold">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Field 3: Long Description Box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Detailed Account & Evidence Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type details concerning your breakdown timeline and room location parameters here..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 resize-none border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all duration-150 leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-3 border-t border-slate-100 shrink-0 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-50"
                >
                  <Send size={12} />
                  {submitting ? "Processing..." : "Commit Ticket"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}