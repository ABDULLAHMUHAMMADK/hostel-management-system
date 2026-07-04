import React, { useState, useEffect } from "react";
import { 
  Plus, 
  RefreshCw, 
  Bell, 
  AlertCircle, 
  Wrench, 
  UtensilsCrossed,
  AlertTriangle,
  X
} from "lucide-react";
import API from "../../api/client";

// ─── Animated Border Component (Left Side) ──────────────────────────────────
function AnimatedBorder({ accent }) {
  return (
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[45%] group-hover:h-full transition-all duration-300 ease-in-out z-20 rounded-r"
      style={{ backgroundColor: accent }}
    />
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, subText }) {
  return (
    <div 
      className="bg-white rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group"
      style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
    >
      <AnimatedBorder accent={accent} />
      <div className="pl-3 z-10">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          {label}
        </p>
        <h2 className="text-2xl font-black text-slate-900 mt-1">{value}</h2>
        {subText && (
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subText}</p>
        )}
      </div>
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
    </div>
  );
}

// ─── Notice Card Component ──────────────────────────────────────────────────
function NoticeCard({ notice }) {
  const getCategoryStyles = (category) => {
    const styles = {
      general: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: Bell },
      maintenance: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: Wrench },
      mess: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", icon: UtensilsCrossed },
      emergency: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: AlertTriangle },
    };
    return styles[category] || styles.general;
  };

  const categoryStyle = getCategoryStyles(notice.category);
  const CategoryIcon = categoryStyle.icon;

  // Different accent colors for each notice card
  const accentColors = ["#8b5cf6", "#3b82f6", "#00a896", "#f59e0b", "#ef4444", "#ec4899"];
  const randomAccent = accentColors[Math.floor(Math.random() * accentColors.length)];

  return (
    <div 
      className="bg-white rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
    >
      <AnimatedBorder accent={randomAccent} />
      
      <div className="pl-3 z-10 relative">
        {/* Header with Category Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}>
              {notice.category}
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {new Date(notice.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-black text-slate-800 mt-2 tracking-tight">
          {notice.title}
        </h3>

        {/* Description */}
        <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
          {notice.description}
        </p>

        {/* Footer with Created By */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/70">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-600">
              {notice.createdBy?.name?.charAt(0) || 'A'}
            </div>
            <span className="text-[9px] font-bold text-slate-400">
              By {notice.createdBy?.name || 'Admin'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
            Global Notice
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 h-44 animate-pulse" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-200 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminNotice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {}
  });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general"
  });
  const [submitting, setSubmitting] = useState(false);

  const cardShadow = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/notices/admin/notices");
      
      if (response.data?.success) {
        setNotices(response.data.data);
        
        // Calculate stats
        const total = response.data.data.length;
        const byCategory = {};
        response.data.data.forEach(notice => {
          byCategory[notice.category] = (byCategory[notice.category] || 0) + 1;
        });
        setStats({ total, byCategory });
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = () => {
    setFormData({
      title: "",
      description: "",
      category: "general"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/notices/admin/notices", formData);

      if (response.data?.success) {
        setSuccess("Notice created successfully!");
        setShowModal(false);
        fetchNotices();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create notice.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6"><Skeleton /></div>;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Bell size={24} className="text-[#00a896]" /> Notice Board
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Create and manage global hostel announcements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotices}
            className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            style={cardShadow}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#00a896] text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-teal-700 transition-colors shadow-md"
            style={cardShadow}
          >
            <Plus size={16} /> Create Notice
          </button>
        </div>
      </div>

      {/* ─── FEEDBACK BANNERS ───────────────────────────────────────────────── */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs rounded-xl">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs rounded-xl">
          ✅ {success}
        </div>
      )}

      {/* ─── STATS CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Notices"
          value={stats.total}
          icon={Bell}
          accent="#8b5cf6"
          subText="All announcements"
        />
        <StatCard
          label="General"
          value={stats.byCategory?.general || 0}
          icon={Bell}
          accent="#3b82f6"
          subText="General announcements"
        />
        <StatCard
          label="Maintenance"
          value={stats.byCategory?.maintenance || 0}
          icon={Wrench}
          accent="#f59e0b"
          subText="Maintenance updates"
        />
        <StatCard
          label="Emergency"
          value={stats.byCategory?.emergency || 0}
          icon={AlertTriangle}
          accent="#ef4444"
          subText="Urgent alerts"
        />
      </div>

      {/* ─── NOTICES GRID ────────────────────────────────────────────────────── */}
      {notices.length === 0 ? (
        <div 
          className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200"
          style={cardShadow}
        >
          <Bell size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-700">No Notices Yet</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Click the "Create Notice" button to post your first announcement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} />
          ))}
        </div>
      )}

      {/* ─── CREATE MODAL (Removed hostelId) ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200"
            style={cardShadow}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Bell size={16} className="text-[#00a896]" /> 
                  Create New Notice
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Post a new global hostel announcement
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                  placeholder="Enter notice title..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors resize-none"
                  placeholder="Enter notice description..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="mess">Mess</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating..." : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}