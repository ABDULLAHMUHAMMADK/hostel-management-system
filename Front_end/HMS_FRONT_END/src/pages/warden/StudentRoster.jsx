import React, { useState, useEffect } from "react";
import API from "../../api/client";
import { 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserMinus, 
  Grid, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import { io } from "socket.io-client";

// --- DARKER HIGH-FIDELITY SKELETON LOADING ---
function StudentPageSkeleton() {
  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 overflow-hidden p-4 animate-pulse select-none font-sans bg-slate-100/50">
      {/* Top Header Mock */}
      <div className="shrink-0 flex justify-between items-start px-1">
        <div className="space-y-2">
          <div className="h-5 w-64 bg-slate-300 rounded-lg" />
          <div className="h-3 w-80 bg-slate-300/70 rounded-md" />
        </div>
        <div className="h-7 w-7 bg-slate-300 rounded-xl" />
      </div>

      {/* Darker Metrics Row Mock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0 p-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-200 h-24 rounded-2xl p-4 border-l-4 border-slate-400 flex flex-col justify-between" style={cardShadowStyle}>
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-400/50 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-6 w-28 bg-slate-400/60 rounded-md" />
              <div className="h-2.5 w-36 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Split Dual Content Mock */}
      <div className="flex-grow grid grid-cols-12 gap-5 min-h-0 p-1">
        {/* Left List Mock */}
        <div className="col-span-12 lg:col-span-7 bg-slate-200 rounded-2xl flex flex-col overflow-hidden p-4 space-y-3" style={cardShadowStyle}>
          <div className="h-8 bg-slate-300 rounded-xl w-full" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-300/60 rounded-xl w-full" />
          ))}
        </div>
        
        {/* Right Chart Mock Panel (Darker Loading Chart) */}
        <div className="col-span-12 lg:col-span-5 bg-slate-200 rounded-2xl p-4 flex flex-col justify-between items-center" style={cardShadowStyle}>
          <div className="h-3 w-28 bg-slate-400/50 rounded self-start" />
          {/* Simulated Donut Chart Ring */}
          <div className="w-32 h-32 rounded-full border-8 border-slate-300 border-t-slate-400/70 animate-spin my-auto flex items-center justify-center">
            <div className="h-4 w-8 bg-slate-400/40 rounded" />
          </div>
          <div className="w-full space-y-2">
            <div className="h-6 bg-slate-300 rounded-xl w-full" />
            <div className="h-6 bg-slate-300 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN STUDENT CONTROLLER UI COMPONENT ---
export default function WardenStudents() {
  const [students, setStudents] = useState([]);
  const [allRooms, setAllRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({ totalPages: 1, totalStudents: 0 });
  const [filterState, setFilterState] = useState("All"); 

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const cardShadowStyle = { 
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" 
  };

  const fetchStudentRoster = async (showLoadingPulse = false) => {
    try {
      if (showLoadingPulse) setLoading(true);
      setError("");
      
      const response = await API.get(`/hostel/search-student`, {
        params: {
          name: searchQuery,
          page: currentPage,
          limit: 6
        }
      });

      if (response.data?.success) {
        setStudents(response.data.data);
        setPaginationData(response.data.pagination || { totalPages: 1, totalStudents: response.data.data.length });
      }
    } catch (err) {
      console.error("Roster Node Failure:", err);
      setError(err.response?.data?.message || "Failed to load student records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await API.get("/hostel/availability");
      if (response.data?.success) {
        setAllRooms(response.data.data);
      }
    } catch (err) {
      console.error("Failed to parse allocation grids:", err);
    }
  };

  useEffect(() => {
    fetchStudentRoster(true);
    fetchAvailableRooms();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchStudentRoster(false);
      } else {
        setCurrentPage(1); 
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    
    const handleUpdatePing = () => {
      fetchStudentRoster(false);
      fetchAvailableRooms();
    };

    socket.on("analytics_updated", handleUpdatePing);
    socket.on("room_layout_changed", handleUpdatePing);

    return () => {
      socket.disconnect();
    };
  }, [currentPage, searchQuery]);

  const handleEvictFromBed = async (studentId, studentName) => {
    if (!window.confirm(`Unassign ${studentName} from their current room layout allocation?`)) return;
    setActionLoading(true);
    try {
      const response = await API.delete(`/hostel/remove-student/${studentId}`);
      if (response.data?.success) {
        await fetchStudentRoster(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Eviction processing was rejected.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!targetRoomId || !selectedStudent) return;
    setActionLoading(true);
    try {
      const response = await API.put(`/hostel/transfer-student/${selectedStudent._id}`, {
        newRoomId: targetRoomId
      });
      if (response.data?.success) {
        setShowTransferModal(false);
        setSelectedStudent(null);
        setTargetRoomId("");
        await fetchStudentRoster(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Transfer operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalRosterCount = paginationData.totalStudents;
  const floatingCount = students.filter(s => !s.roomId).length; 
  const allocatedCount = students.filter(s => !!s.roomId).length;
  
  const allocationRate = totalRosterCount > 0 
    ? Math.round(((totalRosterCount - students.filter(s => !s.roomId).length) / totalRosterCount) * 100) 
    : 0;

  const processedDisplayRows = students.filter(student => {
    if (filterState === "Floating") return !student.roomId;
    if (filterState === "Allocated") return !!student.roomId;
    return true;
  });

  const occupancyPieData = [
    { name: "Assigned Profiles", value: allocatedCount },
    { name: "Floating Profiles", value: floatingCount },
  ];

  const PIE_COLORS = ["#00A896", "#1E2538"];

  if (loading) {
    return <StudentPageSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 select-none font-sans overflow-hidden p-4 bg-slate-50/20 animate-in fade-in duration-300">
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-flex-grow {
          flex-grow: 1 !important;
        }
        @keyframes lineGlowPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
        }
        .animate-line-glow {
          animation: lineGlowPulse 2.5s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}} />

      {/* HEADER AREA */}
      <div className="shrink-0 flex justify-between items-start px-1">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Student Placement Register</h1>
          <p className="text-[10px] font-bold text-slate-400 -mt-0.5 tracking-wide">Track active residents, unallocated profiles, and bed locations</p>
        </div>
        <button 
          onClick={() => fetchStudentRoster(true)}
          className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-500 shadow-sm"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* TOP ROW METRIC CARDS WITH EXPANDING SIDE-BAR ANIMATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0 p-1">
        
        {/* Total Roster Population Card */}
        <div 
          className="bg-white rounded-2xl p-4 flex flex-col justify-between relative pl-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-top-4 duration-300 ease-out" 
          style={cardShadowStyle}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#6366f1] text-[#6366f1] animate-line-glow transition-all duration-300 group-hover:w-[8px]" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Registry</span>
            <span className="text-[9px] font-black uppercase text-[#6366f1] bg-indigo-50 px-1.5 py-0.5 rounded-md transition-colors group-hover:bg-indigo-100">Roster</span>
          </div>
          <div className="mt-2 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none transition-transform duration-300 group-hover:translate-x-1">{totalRosterCount} Students</span>
            <span className="text-[9px] font-bold text-slate-400">Total functional profiles loaded</span>
          </div>
        </div>

        {/* Floating Unassigned Registry Card */}
        <div 
          className="bg-white rounded-2xl p-4 flex flex-col justify-between relative pl-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-top-4 duration-300 delay-70 ease-out" 
          style={cardShadowStyle}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1E2538] text-[#1E2538] animate-line-glow transition-all duration-300 group-hover:w-[8px]" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Floating Roster</span>
            <span className="text-[9px] font-black uppercase text-slate-200 bg-[#1E2538] px-1.5 py-0.5 rounded-md transition-all group-hover:bg-slate-900">Pending Bed</span>
          </div>
          <div className="mt-2 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none transition-transform duration-300 group-hover:translate-x-1">{floatingCount} Page Unassigned</span>
            <span className="text-[9px] font-bold text-slate-400">Requires structural allocation actions</span>
          </div>
        </div>

        {/* Room Placement Allocation Rate Card */}
        <div 
          className="bg-white rounded-2xl p-4 flex flex-col justify-between relative pl-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-top-4 duration-300 delay-150 ease-out" 
          style={cardShadowStyle}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00A896] text-[#00A896] animate-line-glow transition-all duration-300 group-hover:w-[8px]" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Placement Rate</span>
            <span className="text-[9px] font-black uppercase text-teal-100 bg-[#00A896] px-1.5 py-0.5 rounded-md transition-colors group-hover:bg-teal-600">Operational</span>
          </div>
          <div className="mt-2 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none transition-transform duration-300 group-hover:translate-x-1">{allocationRate}% Settled</span>
            <span className="text-[9px] font-bold text-slate-400">Percentage total beds assigned</span>
          </div>
        </div>

      </div>

      {/* MASTER SPLIT-PANEL GRID INTERFACE ASSEMBLY */}
      <div className="flex-grow grid grid-cols-12 gap-5 min-h-0 p-1">
        
        {/* LEFT PANEL: ROSTER REGISTER */}
        <div 
          className="col-span-12 lg:col-span-7 bg-white rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-500 ease-out"
          style={cardShadowStyle}
        >
          {/* Action Filter Block Header */}
          <div className="p-3 border-b border-slate-200 bg-white shrink-0 space-y-2">
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search students by profile name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] transition-all"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              </div>

              <div className="flex gap-1">
                {["All", "Allocated", "Floating"].map((state) => (
                  <button
                    key={state}
                    onClick={() => setFilterState(state)}
                    className={`flex-1 py-1 px-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-[0.98] ${
                      filterState === state 
                        ? "bg-slate-800 border-slate-800 text-white shadow-xs" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COMPRESSED ROSTER RUNWAY LISTING */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50/50">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-center animate-bounce">
                ⚠️ {error}
              </div>
            )}

            {processedDisplayRows.length > 0 ? (
              processedDisplayRows.map((student, index) => (
                <div 
                  key={student._id}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className="bg-white border border-slate-200 rounded-xl py-2 px-2.5 flex items-center justify-between gap-3 transition-all hover:border-slate-400 hover:translate-x-1 hover:shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200 fill-mode-both"
                >
                  <div className="flex items-center gap-2.5 shrink-0 max-w-[45%]">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-[10px] uppercase">
                      {student.name ? student.name.slice(0, 2) : "ST"}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate leading-tight">
                        {student.name}
                      </h4>
                      <span className="block text-[8px] text-slate-400 font-bold truncate mt-0.5">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow flex items-center justify-start overflow-hidden">
                    {student.roomId ? (
                      <div className="flex items-center bg-teal-50 border border-teal-100 text-[#00A896] px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide truncate">
                        <Grid size={9} className="mr-0.5 shrink-0" />
                        <span className="truncate">RM {student.roomId.roomNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center bg-slate-100 border border-slate-300 text-[#1E2538] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap">
                        <HelpCircle size={9} className="mr-0.5 shrink-0" />
                        <span>Floating</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => { setSelectedStudent(student); setTargetRoomId(""); setShowTransferModal(true); }}
                        className="text-slate-600 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all p-1"
                        title={student.roomId ? "Transfer Room Assignment" : "Assign Available Bed Slot"}
                      >
                        {student.roomId ? <MoveHorizontal size={13} /> : <UserCheck size={13} className="text-[#00A896]" />}
                      </button>
                      
                      {student.roomId && (
                        <button
                          onClick={() => handleEvictFromBed(student._id, student.name)}
                          className="text-slate-400 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all p-1"
                          title="Unassign from Room Slot"
                        >
                          <UserMinus size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-white animate-in fade-in duration-300">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No matching profiles</span>
              </div>
            )}
          </div>

          {/* CONTROL FOOTER BAR */}
          <div className="p-2 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between text-[9px] font-black text-slate-500">
            <span className="truncate">Loaded: {totalRosterCount} Total</span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all text-slate-700"
              >
                <ChevronLeft size={11} />
              </button>
              <span className="whitespace-nowrap">{currentPage} / {paginationData.totalPages || 1}</span>
              <button
                disabled={currentPage >= paginationData.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all text-slate-700"
              >
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: DYNAMIC OVERVIEW MATCHED ALLOCATION RATIO CHART CARD */}
        <div 
          className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-4 flex flex-col justify-between h-full min-h-0 relative pl-6 select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-right-4 duration-500 ease-out"
          style={cardShadowStyle}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00A896] text-[#00A896] animate-line-glow transition-all duration-300 group-hover:w-[8px]" />

          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start w-full z-10">
            Page Allocation Ratios
          </h3>

          {/* SEGMENT-SWEEP MONTAGE RADIAL DONUT CONTAINER */}
          <div className="relative w-full flex items-center justify-center min-h-0 py-2 z-10" style={{ flexGrow: 1 }}>
            {totalRosterCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={270}
                    endAngle={-90}
                    isAnimationActive={true}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  >
                    {occupancyPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : null}

            {/* Centered Ring Text Layer Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800 tracking-tight animate-in zoom-in-50 duration-500 delay-100">
                {allocationRate}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned
              </span>
            </div>
          </div>

          {/* Breakdown Legend Lines Block */}
          <div className="shrink-0 space-y-1 w-full pt-1 z-10">
            {/* Assigned Row Item Indicator */}
            <div className="flex justify-between items-center bg-slate-50/60 rounded-xl px-3 py-1 border border-slate-100/50 transition-all hover:bg-slate-100/70">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]" />
                <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wide">Assigned (This Page)</span>
              </div>
              <span className="text-[11px] font-black text-slate-800 tracking-tight">{allocatedCount} Profiles</span>
            </div>

            {/* Floating Row Item Indicator */}
            <div className="flex justify-between items-center bg-slate-50/60 rounded-xl px-3 py-1 border border-slate-100/50 transition-all hover:bg-slate-100/70">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E2538]" />
                <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wide">Floating (This Page)</span>
              </div>
              <span className="text-[11px] font-black text-slate-800 tracking-tight">{floatingCount} Profiles</span>
            </div>
          </div>
        </div>

      </div>

      {/* OVERLAY OPERATION MODAL */}
      {showTransferModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => { setShowTransferModal(false); setSelectedStudent(null); }} />
          <form 
            onSubmit={handleTransferSubmit}
            className="bg-white rounded-xl p-4 w-full max-w-sm space-y-3 border border-slate-200 z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 ease-out"
            style={cardShadowStyle}
          >
            <div>
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                {selectedStudent.roomId ? "Relocate Resident" : "Assign Roster Bed Space"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Target Resident: <span className="text-[#00A896] uppercase">{selectedStudent.name}</span>
              </p>
            </div>

            <div className="space-y-1">
              <select
                required
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 text-xs font-bold rounded-lg focus:outline-none focus:border-[#00A896] transition-all"
              >
                <option value="">Select allocation target room...</option>
                {allRooms
                  .filter(r => r._id !== selectedStudent.roomId?._id && (r.capacity - r.occupiedSeats) > 0)
                  .map(r => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.capacity - r.occupiedSeats} openings remaining)
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowTransferModal(false); setSelectedStudent(null); }}
                className="w-1/2 py-1.5 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-slate-200/70 active:scale-98 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-1.5 bg-[#00A896] text-white font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-teal-700 active:scale-98 transition-all shadow-sm disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}