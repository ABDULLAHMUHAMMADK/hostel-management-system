import React, { useState, useEffect } from "react";
import API from "../../api/client";
import { 
  Megaphone, Plus, FileText, AlertTriangle, 
  Bell, Clock, ShieldAlert, BarChart3 
} from "lucide-react";

export default function WardenNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ title: "", description: "", category: "general" });
  const [metrics, setMetrics] = useState({ total: 0, emergency: 0, maintenance: 0, general: 0 });

  const globalShadow = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/notices/my-hostel");
      if (res.data?.success) {
        const data = res.data.data || [];
        setNotices(data);
        setMetrics({
          total: data.length,
          emergency: data.filter(n => n.category === "emergency").length,
          maintenance: data.filter(n => n.category === "maintenance").length,
          general: data.filter(n => n.category === "general" || n.category === "mess").length
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcement boards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const res = await API.post("/notices/create", form);
      if (res.data?.success) {
        setSuccess("Notice published successfully.");
        setForm({ title: "", description: "", category: "general" });
        await fetchNotices();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen max-h-[92vh] flex flex-col gap-4 p-4 bg-slate-50/50 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} style={globalShadow} className="h-[74px] bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-1 bg-slate-200 rounded-xl" />
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <div style={globalShadow} className="flex-1 bg-slate-200 rounded-xl" />
            <div style={globalShadow} className="h-44 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen max-h-[92vh] flex flex-col gap-4 p-4 bg-slate-50/50 overflow-hidden text-slate-800">
      
      {/* 1. TOP STATS METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: "Active Broadcasts", count: metrics.total, icon: <Megaphone size={16} />, color: "bg-indigo-600", text: "text-indigo-600" },
          { label: "Critical Alerts", count: metrics.emergency, icon: <ShieldAlert size={16} />, color: "bg-rose-600", text: "text-rose-600" },
          { label: "Maintenance Info", count: metrics.maintenance, icon: <AlertTriangle size={16} />, color: "bg-amber-500", text: "text-amber-500" },
          { label: "General Directives", count: metrics.general, icon: <FileText size={16} />, color: "bg-emerald-600", text: "text-emerald-600" }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white rounded-xl p-4 border border-slate-100 overflow-hidden"
            style={globalShadow}
          >
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] ${item.color} rounded-r-md transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0`} />
            
            <div className="flex justify-between items-center pl-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{item.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.count}</h3>
              </div>
              <div className={`p-2.5 rounded-lg bg-slate-50 ${item.text} border border-slate-100 transition-colors duration-300 group-hover:bg-slate-100`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FEEDBACK STATUS BAR */}
      {(error || success) && (
        <div style={globalShadow} className={`p-2.5 border rounded-xl text-xs font-semibold flex items-center gap-3 shrink-0 ${
          success ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          <Bell size={14} className="shrink-0" />
          <p className="truncate">{error || success}</p>
        </div>
      )}

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        
        {/* COMPARTMENT A: FULL HEIGHT INDEPENDENT CREATION SYSTEM */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <div 
            className="group relative bg-white rounded-xl p-5 border border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden"
            style={globalShadow}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] bg-indigo-600 rounded-r-md transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
            
            <div className="pl-2 flex flex-col h-full justify-between min-h-0 gap-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Dispatch Announcement</h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Transmit instant alerts directly onto active student terminals.</p>
              </div>

              <form onSubmit={handleCreateNotice} className="flex-1 flex flex-col justify-between gap-3 min-h-0">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Notice Title</label>
                  <input 
                    type="text" 
                    required 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g., Scheduled Block-A Maintenance" 
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-inner" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Classification Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer shadow-inner"
                  >
                    <option value="general">General Directive</option>
                    <option value="emergency">Critical / Emergency</option>
                    <option value="maintenance">Facility Maintenance</option>
                    <option value="mess">Mess & Dining Hub</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col min-h-0 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block shrink-0">Content Details</label>
                  <textarea 
                    required 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Provide full details regarding the notice scope..." 
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none flex-1 min-h-[80px] shadow-inner" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 select-none shadow-md mt-1"
                >
                  <Plus size={14} /> {submitting ? "Processing Dispatch..." : "Publish Announcement"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* COMPARTMENT B: LOG RECORD STREAM AND GRAPH CONSOLIDATED ROW */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          
          {/* THE MAIN STREAM LOGS BOARD - Expanded automatically via flex-1 */}
          <div 
            className="group relative flex-1 bg-white rounded-xl p-5 border border-slate-100 flex flex-col min-h-0 overflow-hidden"
            style={globalShadow}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] bg-slate-400 rounded-r-md transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
            
            <div className="flex items-center gap-2 text-slate-700 pb-2.5 border-b border-slate-100 shrink-0 pl-2">
              <Clock size={14} className="text-slate-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Notice Board Records</h3>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 mt-3 pr-1 space-y-3 custom-scrollbar pl-2">
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div 
                    key={notice._id} 
                    className="group/item relative bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50/50 overflow-hidden"
                    style={{ boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 12px" }}
                  >
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] rounded-r-md transition-all duration-200 group-hover/item:h-full group-hover/item:top-0 group-hover/item:translate-y-0 ${
                      notice.category === "emergency" ? "bg-rose-500" :
                      notice.category === "maintenance" ? "bg-amber-500" : "bg-indigo-600"
                    }`} />

                    <div className="pl-2 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 tracking-tight">{notice.title}</h4>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            <span className="text-slate-500">Warden Management Team</span>
                            <span>•</span>
                            <span>{new Date(notice.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                          </div>
                        </div>

                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          notice.category === "emergency" ? "bg-rose-50 border-rose-200 text-rose-700" :
                          notice.category === "maintenance" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}>{notice.category}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/70">
                        {notice.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-8 text-center">
                  <Megaphone size={24} className="text-slate-300 mb-2" />
                  <p className="text-[11px] font-bold text-slate-400">No active announcements discovered.</p>
                </div>
              )}
            </div>
          </div>

          {/* LOWER FIXED COLUMN CHART CARD - Reduced slightly to h-36 */}
          <div 
            className="group relative bg-white rounded-xl p-4 border border-slate-100 shrink-0 h-36 overflow-hidden"
            style={globalShadow}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] bg-slate-700 rounded-r-md transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
            <div className="pl-2 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-slate-500" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Alert Volume Share</h2>
              </div>
              
              {/* VERTICAL STACK COLUMN ROWS */}
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  { name: "Emergency Alerts", value: metrics.emergency, max: metrics.total, color: "bg-rose-500", bg: "bg-rose-50/50", text: "text-rose-700", border: "border-rose-100" },
                  { name: "Maintenance Logs", value: metrics.maintenance, max: metrics.total, color: "bg-amber-500", bg: "bg-amber-50/50", text: "text-amber-700", border: "border-amber-100" },
                  { name: "General Directives", value: metrics.general, max: metrics.total, color: "bg-emerald-500", bg: "bg-emerald-50/50", text: "text-emerald-700", border: "border-emerald-100" }
                ].map((bar, bIdx) => {
                  const percent = bar.max > 0 ? (bar.value / bar.max) * 100 : 0;
                  return (
                    <div key={bIdx} className={`p-1.5 rounded-xl border ${bar.border} ${bar.bg} flex items-center justify-between gap-4 h-8`}>
                      <div className="w-1/4 text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
                        {bar.name}
                      </div>
                      
                      <div className="flex-1 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                      </div>

                      <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-white border ${bar.border} ${bar.text} min-w-[24px] text-center`}>
                        {bar.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}