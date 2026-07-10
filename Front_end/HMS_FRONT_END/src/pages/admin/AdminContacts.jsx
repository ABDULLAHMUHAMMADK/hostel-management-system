import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  RefreshCw, 
  Mail, 
  CheckCircle, 
  Clock, 
  Archive, 
  Reply,
  Eye,
  Trash2,
  X,
  Send,
  User,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import API from "../../api/client";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, subText }) {
  return (
    <div className="bg-white rounded-2xl p-5 relative overflow-hidden group" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[30%] group-hover:h-full transition-all duration-300 ease-in-out rounded-r" style={{ backgroundColor: accent }} />
      <div className="pl-4 z-10 relative">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <Icon size={18} style={{ color: accent }} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">{value}</h2>
        {subText && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subText}</p>}
      </div>
    </div>
  );
}

// ─── MESSAGE CARD ─────────────────────────────────────────────────────────────
function MessageCard({ message, onView, onReply, onDelete, onStatusChange }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      read: "bg-blue-50 text-blue-600 border-blue-200",
      replied: "bg-emerald-50 text-emerald-600 border-emerald-200",
      archived: "bg-slate-50 text-slate-500 border-slate-200",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={12} />,
      read: <Eye size={12} />,
      replied: <CheckCircle size={12} />,
      archived: <Archive size={12} />,
    };
    return icons[status] || icons.pending;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-800 truncate">{message.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border ${getStatusColor(message.status)}`}>
              {getStatusIcon(message.status)}
              {message.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium truncate">{message.subject}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{message.message}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Mail size={12} /> {message.email}</span>
            <span className="flex items-center gap-1"><Phone size={12} /> {message.phone}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(message.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onView(message)}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            title="View Message"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onReply(message)}
            className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
            title="Reply"
          >
            <Reply size={15} />
          </button>
          {message.status === "pending" && (
            <button
              onClick={() => onStatusChange(message._id, "read")}
              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              title="Mark as Read"
            >
              <CheckCircle size={15} />
            </button>
          )}
          {message.status !== "archived" && (
            <button
              onClick={() => onStatusChange(message._id, "archived")}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
              title="Archive"
            >
              <Archive size={15} />
            </button>
          )}
          <button
            onClick={() => onDelete(message._id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardShadow = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  // ✅ FIXED: Use /admin/contacts since routes are mounted at /api/admin
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/admin/contacts?status=${filter}&page=${currentPage}`);
      if (response.data?.success) {
        setMessages(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use /admin/contacts/stats
  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/contacts/stats");
      if (response.data?.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filter, currentPage]);

  const handleView = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyText("");
    setShowReplyModal(true);
  };

  // ✅ FIXED: Use /admin/contacts/${id}/reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError("Reply message is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post(`/admin/contacts/${selectedMessage._id}/reply`, {
        replyMessage: replyText
      });
      if (response.data?.success) {
        setSuccess("Reply sent successfully!");
        setShowReplyModal(false);
        fetchMessages();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reply.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Use /admin/contacts/${id}/status
  const handleStatusChange = async (id, status) => {
    try {
      const response = await API.put(`/admin/contacts/${id}/status`, { status });
      if (response.data?.success) {
        fetchMessages();
        fetchStats();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ✅ FIXED: Use /admin/contacts/${id}
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const response = await API.delete(`/admin/contacts/${id}`);
      if (response.data?.success) {
        setSuccess("Message deleted successfully!");
        fetchMessages();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to delete message.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <MessageSquare size={24} className="text-[#00a896]" /> Contact Messages
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            View and manage all incoming contact form submissions
          </p>
        </div>
        <button
          onClick={() => { fetchMessages(); fetchStats(); }}
          className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          style={cardShadow}
        >
          <RefreshCw size={16} />
        </button>
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
          label="Total Messages"
          value={stats.total || 0}
          icon={MessageSquare}
          accent="#8b5cf6"
        />
        <StatCard
          label="Pending"
          value={stats.pending || 0}
          icon={Clock}
          accent="#f59e0b"
          subText="Awaiting review"
        />
        <StatCard
          label="Replied"
          value={stats.replied || 0}
          icon={CheckCircle}
          accent="#00a896"
          subText="Responded to"
        />
        <StatCard
          label="Archived"
          value={stats.archived || 0}
          icon={Archive}
          accent="#94a3b8"
          subText="Closed messages"
        />
      </div>

      {/* ─── FILTER BAR ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl p-3" style={cardShadow}>
        {["all", "pending", "read", "replied", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              filter === status
                ? "bg-[#00a896] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status} ({stats[status] || 0})
          </button>
        ))}
      </div>

      {/* ─── MESSAGES LIST ──────────────────────────────────────────────────── */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200" style={cardShadow}>
          <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-700">No Messages</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {filter === "all" ? "No contact messages yet." : `No ${filter} messages found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onView={handleView}
              onReply={handleReply}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ─── PAGINATION ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-600 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── VIEW MODAL ────────────────────────────────────────────────────── */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={cardShadow}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Mail size={16} className="text-[#00a896]" /> Message Details
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  From {selectedMessage.name}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Name</span>
                <p className="text-sm font-bold text-slate-800">{selectedMessage.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email</span>
                <p className="text-sm font-medium text-slate-700">{selectedMessage.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone</span>
                <p className="text-sm font-medium text-slate-700">{selectedMessage.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Subject</span>
                <p className="text-sm font-bold text-slate-800">{selectedMessage.subject}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Message</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">{selectedMessage.message}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${selectedMessage.status === "pending" ? "bg-amber-50 text-amber-600" : selectedMessage.status === "replied" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}>
                  {selectedMessage.status}
                </span>
              </div>
              {selectedMessage.replyMessage && (
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Reply</span>
                  <p className="text-sm text-teal-600 bg-teal-50 p-3 rounded-xl">{selectedMessage.replyMessage}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              {selectedMessage.status !== "replied" && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleReply(selectedMessage);
                  }}
                  className="w-full py-2 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <Reply size={14} className="inline mr-1" /> Reply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── REPLY MODAL ────────────────────────────────────────────────────── */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" style={cardShadow}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Reply size={16} className="text-[#00a896]" /> Reply to {selectedMessage.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Subject: {selectedMessage.subject}
                </p>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Reply Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-medium text-slate-800 transition-colors resize-none"
                  placeholder="Type your reply here..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
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
                  {submitting ? "Sending..." : <><Send size={14} className="inline mr-1" /> Send Reply</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}