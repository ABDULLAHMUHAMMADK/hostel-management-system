import React, { useState, useEffect } from "react";
import API from "../../api/client";
import {
  Search,
  RefreshCw,
  Layers,
  FileText,
  TrendingUp,
  UserX,
  MoveHorizontal,
  Plus,
  Trash2,
  Sliders,
} from "lucide-react";
import { io } from "socket.io-client";

// ─── ENVIRONMENT-AWARE SOCKET URL ──────────────────────────────────────────
const getSocketUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

// --- DEEPER CONTRAST HIGH-FIDELITY SKELETON COMPONENT ---
function YouTubeStyleSkeleton() {
  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-2 overflow-hidden p-2 animate-pulse select-none font-sans">
      <div className="shrink-0 flex justify-between items-start px-2">
        <div className="space-y-1.5">
          <div className="h-4 w-48 bg-slate-300 rounded" />
          <div className="h-2.5 w-64 bg-slate-300/60 rounded" />
        </div>
        <div className="h-6 w-6 bg-slate-300 rounded-xl" />
      </div>

      <div className="flex-grow grid grid-cols-12 gap-6 items-stretch p-2 overflow-hidden">
        <div className="col-span-12 lg:col-span-5 grid grid-rows-[60%_1fr] gap-4 h-full">
          <div
            className="bg-white rounded-2xl p-4 flex flex-col justify-between h-full relative overflow-hidden"
            style={cardShadowStyle}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />
            <div className="flex justify-between items-center shrink-0 pl-2">
              <div className="h-2.5 w-32 bg-slate-300 rounded" />
              <div className="h-3 w-3 bg-slate-300 rounded" />
            </div>
            <div className="relative flex flex-col items-center justify-center flex-grow my-1">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[12px] border-slate-300 flex items-center justify-center" />
                <div className="absolute text-center flex flex-col items-center justify-center space-y-1">
                  <div className="h-4 w-14 bg-slate-400/80 rounded" />
                  <div className="h-2 w-8 bg-slate-300 rounded" />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 block" />
                <div className="h-2 w-20 bg-slate-300 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 block" />
                <div className="h-2 w-12 bg-slate-300 rounded" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-stretch">
            <div
              className="bg-white rounded-xl p-3 flex flex-col justify-between h-full relative overflow-hidden"
              style={cardShadowStyle}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />
              <div className="flex justify-between items-center pl-1.5">
                <div className="h-2 w-16 bg-slate-300 rounded" />
                <div className="h-3 w-3 bg-slate-300 rounded" />
              </div>
              <div className="my-auto space-y-1.5 pl-1.5">
                <div className="h-4 w-14 bg-slate-400/80 rounded" />
                <div className="h-2 w-24 bg-slate-300 rounded" />
              </div>
              <div className="border-t border-slate-200/60 pt-1.5 pl-1.5">
                <div className="h-3.5 w-16 bg-slate-300 rounded-md" />
              </div>
            </div>

            <div
              className="bg-white rounded-xl p-3 flex flex-col justify-between h-full relative overflow-hidden"
              style={cardShadowStyle}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />
              <div className="flex justify-between items-center pl-1.5">
                <div className="h-2 w-16 bg-slate-300 rounded" />
                <div className="h-3 w-3 bg-slate-300 rounded" />
              </div>
              <div className="my-auto space-y-1.5 pl-1.5">
                <div className="h-4 w-14 bg-slate-400/80 rounded" />
                <div className="h-2 w-24 bg-slate-300 rounded" />
              </div>
              <div className="border-t border-slate-200/60 pt-1.5 pl-1.5">
                <div className="h-3.5 w-16 bg-slate-300 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-span-12 lg:col-span-7 bg-white rounded-2xl flex flex-col h-full overflow-hidden"
          style={cardShadowStyle}
        >
          <div className="p-3 border-b border-slate-300/80 bg-white space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-36 bg-slate-400/80 rounded" />
              <div className="h-4 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8 h-7 bg-slate-200 rounded-xl" />
              <div className="col-span-4 h-7 bg-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-3 pb-8 space-y-2 bg-slate-100/30">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-300/70 rounded-xl p-2 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className="py-0.5 px-2 bg-slate-100 border border-slate-300 rounded-lg min-w-[45px] flex flex-col items-center justify-center">
                    <div className="h-1.5 w-4 bg-slate-300 rounded mb-0.5" />
                    <div className="h-3 w-6 bg-slate-400/70 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-slate-400/80 rounded" />
                  </div>
                </div>
                <div className="flex-grow flex items-center gap-1 px-1">
                  <div className="h-4 w-24 bg-slate-200 rounded-md" />
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div className="h-5 w-12 bg-slate-200 rounded-md" />
                  <div className="h-3 w-12 bg-slate-400/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN CONTROLLER COMPONENT ---
export default function WardenRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 🚀 INITIALIZATION STATE FIELDS
  const [showInitModal, setShowInitModal] = useState(false);
  const [roomBatches, setRoomBatches] = useState([
    { start: "", end: "", type: "single" }
  ]);

  // 📊 INVOICE STATS STATE
  const [invoiceStats, setInvoiceStats] = useState({
    pending: 0,
    paid: 0,
    total: 0,
    overdue: 0
  });

  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  const fetchRoomLayout = async () => {
    try {
      setError("");
      const response = await API.get("/hostel/availability");
      if (response.data?.success) {
        setRooms(response.data.data);
      }
    } catch (err) {
      console.error("Layout Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load room matrix.");
    } finally {
      setLoading(false);
    }
  };

  // 📊 FETCH INVOICE STATS FROM BACKEND
  const fetchInvoiceStats = async () => {
    try {
      const response = await API.get("/fee/fee-stats");
      if (response.data?.success) {
        const stats = response.data.stats;
        const paid = stats.find(s => s._id === "paid")?.count || 0;
        const pending = stats.find(s => s._id === "pending")?.count || 0;
        const overdue = stats.find(s => s._id === "overdue")?.count || 0;
        const total = paid + pending + overdue;
        
        setInvoiceStats({
          pending,
          paid,
          total,
          overdue
        });
      }
    } catch (err) {
      console.error("Failed to fetch invoice stats:", err);
      // Keep default zeros if fetch fails
    }
  };

  useEffect(() => {
    fetchRoomLayout();
    fetchInvoiceStats();

    // ─── ENVIRONMENT-AWARE SOCKET ──────────────────────────────────────────
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      withCredentials: true
    });
    
    socket.on("room_layout_changed", () => {
      fetchRoomLayout();
      fetchInvoiceStats();
    });
    socket.on("analytics_updated", () => {
      fetchRoomLayout();
      fetchInvoiceStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalRoomsCount = rooms.length;
  const totalBedsCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const activeBedsOccupied = rooms.reduce((acc, r) => acc + (r.occupiedSeats || 0), 0);
  const availableBedsFree = totalBedsCapacity - activeBedsOccupied;

  const bedsFilledPercentage =
    totalBedsCapacity > 0 ? Math.min(100, (activeBedsOccupied / totalBedsCapacity) * 100) : 0;

  const bedsFreePercentage =
    totalBedsCapacity > 0 ? Math.min(100, (availableBedsFree / totalBedsCapacity) * 100) : 0;

  const radius = 54;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (bedsFreePercentage / 100) * circumference;

  const handleEvictStudent = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this room assignment slot?`)) return;
    setActionLoading(true);
    try {
      const response = await API.delete(`/hostel/remove-student/${studentId}`);
      if (response.data?.success) {
        await fetchRoomLayout();
        await fetchInvoiceStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Eviction processing failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!targetRoomId || !studentToTransfer) return;
    setActionLoading(true);
    try {
      const response = await API.put(`/hostel/transfer-student/${studentToTransfer._id}`, {
        newRoomId: targetRoomId,
      });
      if (response.data?.success) {
        setShowTransferForm(false);
        setStudentToTransfer(null);
        setTargetRoomId("");
        await fetchRoomLayout();
        await fetchInvoiceStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Transfer operation rejected.");
    } finally {
      setActionLoading(false);
    }
  };

  // 🚀 HANDLERS FOR THE ROOM INITIALIZER BATCH FORM
  const handleAddBatchRow = () => {
    setRoomBatches([...roomBatches, { start: "", end: "", type: "single" }]);
  };

  const handleRemoveBatchRow = (index) => {
    if (roomBatches.length === 1) return;
    setRoomBatches(roomBatches.filter((_, i) => i !== index));
  };

  const handleBatchChange = (index, field, value) => {
    const updated = [...roomBatches];
    updated[index][field] = field === "start" || field === "end" ? (value === "" ? "" : Number(value)) : value;
    setRoomBatches(updated);
  };

  const handleInitializeSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await API.post("/hostel/initialize-rooms", { roomBatches });
      if (response.data?.success) {
        alert(response.data.message || "Rooms setup completed!");
        setShowInitModal(false);
        setRoomBatches([{ start: "", end: "", type: "single" }]);
        await fetchRoomLayout();
        await fetchInvoiceStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Initialization rejected. Please verify your room ranges.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber
      .toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    if (statusFilter === "All") return matchesSearch;
    if (statusFilter === "Full") return matchesSearch && room.occupiedSeats >= room.capacity;
    if (statusFilter === "Available") return matchesSearch && room.occupiedSeats < room.capacity;
    return matchesSearch;
  });

  if (loading) {
    return <YouTubeStyleSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-2 select-none font-sans overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes customCircleFillAnim {
          from { stroke-dashoffset: ${circumference}; }
          to { stroke-dashoffset: ${strokeDashoffset}; }
        }
        .animate-circle-fill {
          animation: customCircleFillAnim 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .extending-hover-card {
          position: relative;
        }
        .extending-hover-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          border-radius: 0px 4px 4px 0px;
          transition: height 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 20;
        }
        .extending-hover-card:hover::before {
          height: 100% !important;
        }

        .accent-teal-main::before { height: 25%; background: linear-gradient(to bottom, #00a896, #028074); }
        .accent-teal-sub::before { height: 25%; background: linear-gradient(to bottom, #0d9488, #115e59); }
        .accent-amber::before { height: 25%; background: linear-gradient(to bottom, #f59e0b, #d97706); }
        .accent-slate-register::before { height: 25%; background: linear-gradient(to bottom, #94a3b8, #475569); }
      `,
        }}
      />

      {/* HEADER SECTION */}
      <div className="shrink-0 flex justify-between items-start px-2">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">
            Hostel Space Manager
          </h1>
          <p className="text-[10px] font-bold text-slate-400 -mt-0.5 tracking-wide">
            Live administrative overview and layout logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a896] hover:bg-teal-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            <Sliders size={11} /> Initialize Rooms
          </button>
          <button
            onClick={() => {
              fetchRoomLayout();
              fetchInvoiceStats();
            }}
            className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* 🚀 CONDITIONAL EMPTY SETUP VIEWPORT OR WORKSPACE CONTENT GRID */}
      {rooms.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl m-2" style={cardShadowStyle}>
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center text-[#00a896] mb-3">
            <Layers size={26} />
          </div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Hostel Inventory Not Initialized</h2>
          <p className="text-xs text-slate-400 font-medium text-center max-w-sm mt-1 mb-4 leading-normal">
            Welcome to your new hostel environment! Before students can enroll or accept room allocations, you must map out your building's room layout boundaries.
          </p>
          <button
            onClick={() => setShowInitModal(true)}
            className="px-4 py-2 bg-[#00a896] hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md transform active:scale-95"
          >
            Launch Room Matrix Initializer
          </button>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-12 gap-6 items-stretch p-2 overflow-hidden">
          {/* LEFT COLUMN: VISUAL INDEX AND METRIC CARDS */}
          <div className="col-span-12 lg:col-span-5 grid grid-rows-[60%_1fr] gap-4 h-full">
            <div
              className="extending-hover-card accent-teal-main bg-white rounded-2xl p-4 flex flex-col justify-between pl-6 overflow-hidden"
              style={cardShadowStyle}
            >
              <div className="flex justify-between items-center shrink-0 z-10">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Bed Occupancy Ratio
                </span>
                <TrendingUp size={12} className="text-emerald-500" />
              </div>

              <div className="relative flex flex-col items-center justify-center flex-grow z-10">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      className="text-[#00a896]"
                      strokeWidth={strokeWidth}
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      className="text-[#1e2538] animate-circle-fill"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute text-center">
                    <span className="text-xl font-black text-slate-800 tracking-tight block">
                      {bedsFilledPercentage.toFixed(1)}%
                    </span>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                      Filled
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-4 text-[10px] font-bold text-slate-500 shrink-0 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00a896] block" />
                  <span>{activeBedsOccupied} Beds filled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1e2538] block" />
                  <span>{availableBedsFree} Free</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div
                className="extending-hover-card accent-teal-sub bg-white rounded-xl p-3 flex flex-col justify-between pl-5 overflow-hidden"
                style={cardShadowStyle}
              >
                <div className="flex justify-between items-center text-slate-400 z-10">
                  <span className="text-[8px] font-black uppercase tracking-wider">
                    Room Matrix
                  </span>
                  <Layers size={13} className="text-teal-600" />
                </div>
                <div className="my-auto z-10">
                  <span className="text-base font-black text-slate-800 block leading-tight">
                    {totalRoomsCount} Rooms
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    Total functional units
                  </span>
                </div>
                <div className="border-t border-slate-100/70 pt-1.5 z-10">
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    {availableBedsFree} Beds Free
                  </span>
                </div>
              </div>

              {/* 📊 UPDATED INVOICE AUDIT CARD WITH REAL DATA */}
              <div
                className="extending-hover-card accent-amber bg-white rounded-xl p-3 flex flex-col justify-between pl-5 overflow-hidden"
                style={cardShadowStyle}
              >
                <div className="flex justify-between items-center text-slate-400 z-10">
                  <span className="text-[8px] font-black uppercase tracking-wider">
                    Invoice Audit
                  </span>
                  <FileText size={13} className="text-amber-500" />
                </div>
                <div className="my-auto z-10">
                  <span className="text-base font-black text-slate-800 block leading-tight">
                    {invoiceStats.pending + invoiceStats.overdue} Pending
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {invoiceStats.pending > 0 || invoiceStats.overdue > 0 
                      ? 'Awaiting clearance' 
                      : 'All invoices cleared ✅'}
                  </span>
                </div>
                <div className="border-t border-slate-100/70 pt-1.5 z-10">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                    invoiceStats.paid > 0 
                      ? 'text-teal-600 bg-teal-50' 
                      : 'text-slate-400 bg-slate-50'
                  }`}>
                    {invoiceStats.paid} Fully Paid
                  </span>
                  {invoiceStats.overdue > 0 && (
                    <span className="ml-1 text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                      {invoiceStats.overdue} Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SCROLLABLE INVENTORY REGISTER */}
          <div
            className="extending-hover-card accent-slate-register col-span-12 lg:col-span-7 bg-white rounded-2xl flex flex-col h-full overflow-hidden pl-5"
            style={cardShadowStyle}
          >
            <div className="p-3 bg-white shrink-0 space-y-2 pr-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Live Inventory Register
                </h2>
                <span className="text-[10px] font-black bg-slate-100 border border-slate-300 text-slate-600 px-2 py-0.5 rounded-md">
                  {totalRoomsCount} Rooms total
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8 relative">
                  <input
                    type="text"
                    placeholder="Type Room number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a896] transition-all"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                </div>

                <div className="col-span-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:border-[#00a896]"
                  >
                    <option value="All">All States</option>
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 pb-16 space-y-2 bg-slate-50 mr-1 rounded-br-2xl">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div
                    key={room._id}
                    className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 flex items-center justify-between gap-4 transition-all hover:border-slate-300 hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="py-0.5 px-2 bg-slate-100 border border-slate-200 rounded-lg text-center min-w-[48px]">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider block">
                          Rm
                        </span>
                        <span className="text-xs font-black text-slate-800 tracking-tight">
                          {room.roomNumber}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                          {room.roomType || room.type}
                        </h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">
                          Max: {room.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-wrap items-center gap-1 px-1">
                      {room.residents && room.residents.length > 0 ? (
                        room.residents.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center bg-emerald-50 border border-emerald-200 text-[#00a896] px-2 py-0.5 rounded-md text-xs font-black tracking-wide max-w-[150px]"
                          >
                            <span className="truncate uppercase">{student.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[9px] font-black tracking-wider text-slate-400 border border-dashed border-slate-300 bg-slate-100/60 px-2 py-0.5 rounded-md uppercase">
                          Vacant Space
                        </span>
                      )}

                      {room.availableSeats > 0 && room.residents?.length > 0 && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Plus size={8} /> Open Slot
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-4 border-l border-slate-200 pl-3">
                      {room.residents && room.residents.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {room.residents.map((student) => (
                            <div
                              key={student._id}
                              className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5"
                            >
                              <button
                                onClick={() => {
                                  setStudentToTransfer(student);
                                  setTargetRoomId("");
                                  setShowTransferForm(true);
                                }}
                                className="text-slate-600 hover:text-teal-600 transition-colors p-1"
                                title={`Transfer ${student.name}`}
                              >
                                <MoveHorizontal size={17} />
                              </button>
                              <button
                                onClick={() =>
                                  handleEvictStudent(student._id, student.name)
                                }
                                className="text-slate-500 hover:text-rose-600 transition-colors p-1"
                                title={`Evict ${student.name}`}
                              >
                                <UserX size={17} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}

                      <div className="text-right flex flex-col items-end min-w-[60px]">
                        <div className="flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${room.availableSeats === 0 ? "bg-rose-500" : "bg-emerald-400"}`}
                          />
                          <span className="text-[11px] font-black text-slate-800 tracking-tight">
                            {room.occupiedSeats}/{room.capacity} Beds
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    No matching rooms found
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 INITIALIZE ROOMS MODAL DIALOG */}
      {showInitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleInitializeSubmit}
            className="bg-white rounded-2xl p-5 w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl border border-slate-200"
            style={cardShadowStyle}
          >
            <div className="shrink-0 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-[#00a896]" /> Build Room Infrastructure Layout
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Generate bulk rooms using progressive sequence blocks.
              </p>
            </div>

            {/* Scrollable Form Body Container */}
            <div className="flex-grow overflow-y-auto my-3 pr-1 space-y-3 max-h-[50vh]">
              {roomBatches.map((batch, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-end bg-slate-50 border border-slate-200/80 p-3 rounded-xl relative group"
                >
                  <div className="col-span-4 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">
                      Start Room #
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 101"
                      value={batch.start}
                      onChange={(e) => handleBatchChange(idx, "start", e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-lg px-2 py-1 text-xs font-bold text-slate-800 transition-colors"
                    />
                  </div>

                  <div className="col-span-4 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">
                      End Room #
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 110"
                      value={batch.end}
                      onChange={(e) => handleBatchChange(idx, "end", e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-lg px-2 py-1 text-xs font-bold text-slate-800 transition-colors"
                    />
                  </div>

                  <div className="col-span-3 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">
                      Room Classification
                    </label>
                    <select
                      value={batch.type}
                      onChange={(e) => handleBatchChange(idx, "type", e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-lg px-1.5 py-1 text-xs font-black text-slate-700"
                    >
                      <option value="single">Single Seater</option>
                      <option value="2-seater">2 Seater</option>
                      <option value="3-seater">3 Seater</option>
                      <option value="4-seater">4 Seater</option>
                      <option value="5-seater">5 Seater</option>
                    </select>
                  </div>

                  <div className="col-span-1 flex justify-center pb-0.5">
                    <button
                      type="button"
                      disabled={roomBatches.length === 1}
                      onClick={() => handleRemoveBatchRow(idx)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      title="Delete Row Range"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddBatchRow}
                className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-[#00a896] bg-white text-slate-500 hover:text-[#00a896] rounded-xl flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                <Plus size={12} /> Append Structural Sequence Range
              </button>
            </div>

            <div className="shrink-0 flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowInitModal(false);
                  setRoomBatches([{ start: "", end: "", type: "single" }]);
                }}
                className="w-1/2 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
              >
                Dismiss Layout
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
              >
                {actionLoading ? "Executing Build..." : "Deploy Structural Matrix"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferForm && studentToTransfer && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleTransferSubmit}
            className="bg-white rounded-xl p-4 w-full max-w-sm space-y-3 shadow-2xl border border-slate-200"
            style={cardShadowStyle}
          >
            <div>
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Relocate Resident
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Shifting footprint for:{" "}
                <span className="text-[#00a896] uppercase">{studentToTransfer.name}</span>
              </p>
            </div>

            <div className="space-y-1">
              <select
                required
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 text-xs font-bold rounded-lg focus:outline-none focus:border-[#00a896]"
              >
                <option value="">Select target room...</option>
                {rooms
                  .filter((r) => r.availableSeats > 0)
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.availableSeats} slots free)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowTransferForm(false);
                  setStudentToTransfer(null);
                }}
                className="w-1/2 py-1.5 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-slate-200/70 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-1.5 bg-[#00a896] text-white font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                {actionLoading ? "Moving..." : "Confirm Move"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}