import { useEffect, useState } from "react";
import API from "../../api/client";
import { io } from "socket.io-client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  Search, 
  Layers, 
  UserPlus, 
  UserMinus, 
  ShieldAlert, 
  TrendingUp, 
  BedDouble, 
  Coins,
  ArrowLeftRight
} from "lucide-react";

// ─── YOUTUBE-STYLE SKELETON LOADING TEMPLATE ─────────────────────────────────
function YouTubeStyleSkeleton() {
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 overflow-hidden p-2 animate-pulse select-none">
      {/* Header Titles */}
      <div className="space-y-2 shrink-0">
        <div className="h-7 w-72 bg-slate-200 rounded-lg" />
        <div className="h-3 w-56 bg-slate-200 rounded" />
      </div>

      {/* Grid Blueprint */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] items-stretch">
        
        {/* Left Layout Skeleton */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
          {/* Main Ring Box */}
          <div 
            className="bg-slate-200/60 rounded-2xl flex flex-col items-center justify-center flex-grow p-6 relative"
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          >
            <div className="absolute top-4 left-4 h-3 w-32 bg-slate-300 rounded" />
            <div className="h-40 w-40 rounded-full border-[14px] border-slate-300/70 flex items-center justify-center" />
            <div className="absolute bottom-4 h-3 w-48 bg-slate-300 rounded" />
          </div>
          
          {/* Lower Small Sub-Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="h-24 bg-slate-200/60 rounded-2xl p-4 space-y-3" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
              <div className="h-3 w-16 bg-slate-300 rounded" />
              <div className="h-5 w-24 bg-slate-300 rounded" />
            </div>
            <div className="h-24 bg-slate-200/60 rounded-2xl p-4 space-y-3" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
              <div className="h-3 w-16 bg-slate-300 rounded" />
              <div className="h-5 w-24 bg-slate-300 rounded" />
            </div>
          </div>
        </div>
        
        {/* Right Layout Skeleton */}
        <div 
          className="lg:col-span-7 bg-slate-200/40 rounded-2xl border border-slate-200/60 flex flex-col h-full overflow-hidden"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          {/* Search Header Area */}
          <div className="p-4 border-b border-slate-200/60 bg-white/50 space-y-3 shrink-0">
            <div className="h-4 w-36 bg-slate-300 rounded" />
            <div className="flex gap-3">
              <div className="h-9 bg-slate-300 rounded-xl flex-grow" />
              <div className="h-9 w-28 bg-slate-300 rounded-xl" />
            </div>
          </div>

          {/* Video Style Feed Rows */}
          <div className="flex-grow p-4 space-y-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 bg-white/80 rounded-xl flex items-center justify-between gap-4 border border-slate-200/40">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="h-10 w-10 rounded-full bg-slate-300 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-3.5 w-16 bg-slate-300 rounded" />
                    <div className="h-2.5 w-12 bg-slate-300 rounded" />
                  </div>
                </div>
                <div className="h-8 w-1/3 bg-slate-300 rounded-xl" />
                <div className="h-4 w-16 bg-slate-300 rounded-md" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN COMPONENT MODULE ───────────────────────────────────────────────────
export default function WardenRooms() {
  const [rooms, setRooms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTransferMenu, setActiveTransferMenu] = useState(null);

  const fetchInventoryData = async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      setError("");
      const [availabilityRes, analyticsRes] = await Promise.all([
        API.get(`/hostel/availability${searchQuery ? `?roomNumber=${searchQuery}` : ""}`),
        API.get("/hostel/analytics")
      ]);
      if (availabilityRes.data.success) setRooms(availabilityRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      console.error("Inventory Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load updated hostel system indices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData(true);
    
    const socket = io("http://localhost:5000", { withCredentials: true });
    socket.on("room_layout_changed", () => {
      fetchInventoryData(false);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [searchQuery]);

  const handleEviction = async (studentId) => {
    if (!window.confirm("Are you sure you want to evict this student from this room slot?")) return;
    try {
      const response = await API.put(`/hostel/remove-student/${studentId}`);
      if (response.data.success) setActiveTransferMenu(null);
    } catch (err) {
      alert(err.response?.data?.message || "Eviction transaction rejected.");
    }
  };

  const handleTransferSubmit = async (studentId, targetRoomId) => {
    try {
      const response = await API.patch(`/hostel/transfer-student/${studentId}`, { newRoomId: targetRoomId });
      if (response.data.success) setActiveTransferMenu(null);
    } catch (err) {
      alert(err.response?.data?.message || "Transfer rejected by routing engine.");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "full") return room.isFull === "Full";
    if (statusFilter === "available") return room.isFull === "Available";
    return true;
  });

  if (loading) {
    return <YouTubeStyleSkeleton />;
  }

  // Active color is teal, vacant space color updated to premium dark slate color from image_eba1e1.png
  const chartData = [
    { name: "Active", value: analytics?.occupiedBeds || 0, color: "#00a896" },
    { name: "Vacant", value: analytics?.availableBeds || 0, color: "#1e2538" }
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 overflow-hidden p-1 select-none">
      <div className="shrink-0">
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Hostel Physical Space Manager</h1>
        <p className="text-[11px] font-bold text-slate-400 -mt-0.5 tracking-wide">Live administrative overview and layout assignment logs</p>
      </div>

      {error && (
        <div className="shrink-0 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
          <ShieldAlert size={14} /> {error}
        </div>
      )}

      {/* Main Grid View Container */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] items-stretch">
        
        {/* LEFT COLUMN: Occupancy Donut Layout */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
          <div 
            className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center relative flex-grow" 
            style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          >
            <div className="w-full flex items-center justify-between mb-2 absolute top-4 px-6">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Live Occupancy Index</span>
              <TrendingUp size={16} className="text-[#00a896]" />
            </div>

            <div className="relative h-44 w-44 flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={64} outerRadius={76} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800 tracking-tight leading-none">{analytics?.hostelOccupancy || "0%"}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1">Beds Filled</span>
              </div>
            </div>

            <div className="absolute bottom-4 flex items-center gap-6 text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00a896]" />
                <span>{analytics?.occupiedBeds || 0} Beds Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1e2538]" />
                <span>{analytics?.availableBeds || 0} Available</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div 
              className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col justify-between h-24" 
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Room Allocation</span>
                <Layers size={14} className="text-teal-600" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-800 block leading-none">{analytics?.totalRooms || 0} Rooms</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wide mt-1 block">{analytics?.occupiedRooms || 0} Occupied · {analytics?.availableRooms || 0} Free</span>
              </div>
            </div>

            <div 
              className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col justify-between h-24" 
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Invoice Audit</span>
                <Coins size={14} className="text-amber-500" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-800 block leading-none">{analytics?.financials?.totalPendingInvoices || 0} Pending</span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wide mt-1 block">{analytics?.financials?.totalPaidInvoices || 0} Paid</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Symmetrical Bounded Data Container Panel */}
        <div 
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 flex flex-col h-full overflow-hidden" 
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <div className="p-4 border-b border-slate-100 bg-white shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Live Inventory Register</h3>
              <span className="text-[10px] font-extrabold bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md">Listing {filteredRooms.length} Rooms</span>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Type Room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00a896] focus:bg-white transition-all"
                />
                <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#00a896] cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="available">Vacant Spaces</option>
                <option value="full">Fully Packaged</option>
              </select>
            </div>
          </div>

          {/* Internal Scroller Window */}
          <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-slate-50/30">
            {filteredRooms.map((room) => (
              <div key={room._id} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex items-center justify-between gap-4 rounded-xl">
                {/* Room Info */}
                <div className="w-28 shrink-0 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                    <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase -mb-0.5">Room</span>
                    <span className="text-sm font-black text-slate-700 tracking-tight leading-none">{room.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-700 block capitalize">{room.roomType}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">Max: {room.capacity}</span>
                  </div>
                </div>

                {/* Residents List Container */}
                <div className="flex-grow flex flex-wrap items-center gap-2 min-w-0">
                  {room.residents && room.residents.length > 0 ? (
                    room.residents.map((resident) => {
                      const isMenuOpen = activeTransferMenu === resident._id;
                      return (
                        <div key={resident._id} className="relative flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-900 rounded-xl max-w-[240px]">
                          <span className="text-xs font-bold text-teal-950 truncate max-w-[110px]">{resident.name}</span>
                          
                          {/* Control Tools - Statically Visible */}
                          <div className="flex items-center gap-1 shrink-0 border-l border-teal-200 pl-1.5 ml-0.5">
                            <button
                              onClick={() => setActiveTransferMenu(isMenuOpen ? null : resident._id)}
                              title="Assign/Transfer Room"
                              className={`p-1 rounded transition-colors ${isMenuOpen ? 'bg-[#00a896] text-white' : 'bg-white text-teal-700 hover:bg-slate-100 border border-slate-200'}`}
                            >
                              <ArrowLeftRight size={10} />
                            </button>
                            <button 
                              onClick={() => handleEviction(resident._id)}
                              title="Evict Student"
                              className="p-1 bg-white text-rose-600 rounded border border-slate-200 hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <UserMinus size={10} />
                            </button>
                          </div>

                          {/* Transfer Menu Dropdown */}
                          {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl p-1 z-30 max-h-40 overflow-y-auto shadow-2xl">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-2 py-1 border-b border-slate-100">Transfer Target Room</span>
                              {rooms.filter(r => r._id !== room._id && r.isFull !== "Full").map(availableRoom => (
                                <button
                                  key={availableRoom._id}
                                  onClick={() => handleTransferSubmit(resident._id, availableRoom._id)}
                                  className="w-full text-left text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#00a896] px-2 py-1.5 rounded-lg block"
                                >
                                  Room {availableRoom.roomNumber} ({availableRoom.availableSeats} open)
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 italic tracking-wide px-2 py-1 border border-dashed border-slate-200 rounded-xl flex items-center gap-1">
                      <BedDouble size={11} /> Entirely Vacant Space Ready
                    </span>
                  )}

                  {room.isFull !== "Full" && room.residents?.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200/80 px-2 py-1 rounded-xl flex items-center gap-1">
                      <UserPlus size={10} /> Open Bed
                    </span>
                  )}
                </div>

                {/* Capacity Status Badges */}
                <div className="w-24 shrink-0 flex flex-col items-end space-y-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${room.isFull === "Full" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                    {room.isFull}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-500">{room.occupiedSeats} / {room.capacity} Beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}