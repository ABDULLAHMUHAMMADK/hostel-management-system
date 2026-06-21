import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { FileText, AlertTriangle, CheckCircle, PlusCircle, History, Send, ShieldAlert } from "lucide-react";
import API from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function NoticesComplaintsHub() {
  const { user } = useAuth();

  // 1. Core Component UI State
  const [activeTab, setActiveTab] = useState("view"); // "view" | "create"
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // New Complaint Form Fields State
  const [formData, setFormData] = useState({
    title: "",
    category: "maintenance", // maintenance, mess, clean, security, other
    description: "",
  });

  // 2. Data Retrieval Pipeline Engine
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

  // 3. Real-Time Socket Interceptor Stream
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

  // 4. Form Submission Control Action
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Please fill out all fields before committing database payload.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await API.post("/complaint/create", formData);

      if (res.data?.success) {
        setSuccessMessage("Complaint dispatched smoothly directly to warden ledger matrix.");
        setFormData({ title: "", category: "maintenance", description: "" });
        setActiveTab("view");
        refreshHubMatrix(false);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Internal mutation failure handling your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const safeNotices = Array.isArray(notices) ? notices : [];
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex space-x-2 items-center text-slate-400 text-xs font-black uppercase tracking-widest">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <span>Synchronizing Support Hub Matrix...</span>
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
            Notices & Complaints
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
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              🎉 {successMessage}
            </div>
          )}
        </div>
      )}

      {/* CORE SPLIT WORKSPACE INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 pb-1" style={{ flexGrow: 1 }}>
        
        {/* LEFT COMPARTMENT PANELS: NOTICES GRID BOARD PANEL (Takes 5 Cols) */}
        <div
          className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50 lg:col-span-5"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          {/* Absolute Minimal Center-Weighted Dynamic Edge Accent Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-amber-500" />

          <div className="mb-3 shrink-0 flex justify-between items-center">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Notice Board Matrix
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Official broadcasts from Warden Admin authority
              </p>
            </div>
            <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {safeNotices.length} Alerts
            </span>
          </div>

          {/* Notices Scroller Area */}
          <div className="overflow-y-auto min-h-0 space-y-3 pr-1" style={{ flexGrow: 1 }}>
            {safeNotices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={24} className="text-slate-300 mb-1" />
                <p className="text-[11px] font-bold text-center">Notice transmission stream empty</p>
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

        {/* RIGHT COMPARTMENT PANELS: COMPLAINT CONTROLLER CENTRE (Takes 7 Cols) */}
        <div
          className="group relative bg-white rounded-2xl p-4 pl-5 flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 hover:bg-slate-50/50 lg:col-span-7"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          {/* Absolute Minimal Center-Weighted Dynamic Edge Accent Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[45%] rounded-r transition-all duration-300 ease-out group-hover:h-full group-hover:rounded-none bg-indigo-500" />

          {/* Tab Subheader Actions Block Area */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Complaints Workspace
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                File grievances or track current infrastructure issues
              </p>
            </div>

            {/* Custom Segment Tab Controls - Seamless and borderless alignment style */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("view")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "view"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <History size={12} />
                Track ({safeComplaints.length})
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "create"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <PlusCircle size={12} />
                File Ticket
              </button>
            </div>
          </div>

          {/* TAB 1 CONTENT PANEL VIEW MODULE: RENDER & TRACK COMPLAINTS */}
          {activeTab === "view" && (
            <div className="overflow-y-auto min-h-0 space-y-2.5 pr-1 flex-1">
              {safeComplaints.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <CheckCircle size={28} className="text-emerald-400 mb-1.5" />
                  <p className="text-[11px] font-bold text-center">Your history sheet is pristine</p>
                  <p className="text-[10px] font-medium text-slate-400 text-center">No structural complaints logged.</p>
                </div>
              ) : (
                safeComplaints.map((c) => (
                  <div key={c._id} className="p-3 rounded-xl bg-slate-50 flex items-start justify-between gap-3 transition-colors duration-200 hover:bg-slate-100/50">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black tracking-tight text-slate-400 uppercase bg-slate-200 px-1.5 py-0.2 rounded">
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
          )}

          {/* TAB 2 CONTENT PANEL VIEW MODULE: LOG NEW COMPLAINT RECORD TO DB */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateComplaint} className="flex-1 flex flex-col justify-between min-h-0 pr-1">
              <div className="space-y-4 overflow-y-auto min-h-0 pb-2">
                
                {/* Field 1: Title Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Defect Title / Subject Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Room 302 Ceiling Fan Regulation Malfunction"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                  />
                </div>

                {/* Field 2: Category Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    System Department Classification
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                  >
                    <option value="maintenance">Civil & Electrical Maintenance</option>
                    <option value="mess">Hostel Mess & Catering Services</option>
                    <option value="clean">Sanitation & Structural Cleaning</option>
                    <option value="security">Compound Security Operations</option>
                    <option value="other">General Miscellaneous / Other Issues</option>
                  </select>
                </div>

                {/* Field 3: Long Description Box */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Detailed Account & Evidence Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide granular technical details concerning the breakdown timeline so maintenance engineers arrive equipped appropriately."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                  />
                </div>
              </div>

              {/* Action Operations Control Footer Dispatch Trigger */}
              <div className="pt-3 border-t border-slate-100 shrink-0 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-50"
                >
                  <Send size={12} />
                  {submitting ? "Processing Dispatch..." : "Commit Ticket"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}