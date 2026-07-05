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

// ─── ENVIRONMENT-AWARE SOCKET URL ──────────────────────────────────────────
const getSocketUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

// --- DARKER HIGH-FIDELITY SKELETON LOADING ---
function StudentPageSkeleton() {
  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3 overflow-hidden p-3 select-none font-sans bg-slate-100/50">
      <div className="shrink-0 flex justify-between items-start pt-0 px-1">
        <div className="space-y-1">
          <div className="h-5 w-64 bg-slate-300 rounded-lg" />
          <div className="h-3 w-80 bg-slate-300/70 rounded-md" />
        </div>
        <div className="h-7 w-7 bg-slate-300 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 p-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-200 h-22 rounded-2xl p-3 flex flex-col justify-between" style={cardShadowStyle}>
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-400/50 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="h-6 w-28 bg-slate-400/60 rounded-md" />
              <div className="h-2.5 w-36 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-grow grid grid-cols-12 gap-4 min-h-0 p-1">
        <div className="col-span-12 lg:col-span-7 bg-slate-200 rounded-2xl flex flex-col overflow-hidden p-3 space-y-2" style={cardShadowStyle}>
          <div className="h-8 bg-slate-300 rounded-xl w-full" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-300/60 rounded-xl w-full" />
          ))}
        </div>
        
        <div className="col-span-12 lg:col-span-5 bg-slate-200 rounded-2xl p-3 flex flex-col justify-between items-center" style={cardShadowStyle}>
          <div className="h-3 w-28 bg-slate-400/50 rounded self-start" />
          <div className="w-32 h-32 rounded-full my-auto flex items-center justify-center">
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

  // ─── ENVIRONMENT-AWARE SOCKET ────────────────────────────────────────────
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      withCredentials: true
    });
    
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
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3 font-sans overflow-hidden p-3 pt-1 bg-slate-50/20">
      
      <style dangerouslySetInnerHTML={{__html: `
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
          height: 25%;
          border-radius: 0px 4px 4px 0px;
          transition: height 0.35s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 20;
        }
        .extending-hover-card:hover::before {
          height: 100%;
        }
        
        .accent-indigo::before { background: linear-gradient(to bottom, #818cf8, #6366f1); }
        .accent-slate::before { background: linear-gradient(to bottom, #475569, #1e293b); }
        .accent-teal::before { background: linear-gradient(to bottom, #2dd4bf, #00A896); }
      `}} />

      {/* HEADER AREA */}
      <div className="shrink-0 flex justify-between items-start pt-0 px-1">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase leading-none">Student Placement Register</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wide">Track active residents, unallocated profiles, and bed locations</p>
        </div>
        <button 
          onClick={() => fetchStudentRoster(true)}
          className="p-1.5 bg-white rounded-xl transition-all text-slate-500 shadow-sm -mt-1"
        >
          <RefreshCw size={11} />
        </button>
      </div>

      {/* TOP ROW METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 p-1">
        
        {/* Total Roster Population Card */}
        <div 
          className="extending-hover-card accent-indigo bg-white rounded-2xl p-3.5 flex flex-col justify-between pl-6 overflow-hidden" 
          style={cardShadowStyle}
        >
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Registry</span>
            <span className="text-[9px] font-black uppercase text-[#6366f1] bg-indigo-50 px-1.5 py-0.5 rounded-md">Roster</span>
          </div>
          <div className="mt-1.5 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none">{totalRosterCount} Students</span>
            <span className="text-[9px] font-bold text-slate-400">Total functional profiles loaded</span>
          </div>
        </div>

        {/* Floating Unassigned Registry Card */}
        <div 
          className="extending-hover-card accent-slate bg-white rounded-2xl p-3.5 flex flex-col justify-between pl-6 overflow-hidden" 
          style={cardShadowStyle}
        >
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Floating Roster</span>
            <span className="text-[9px] font-black uppercase text-slate-200 bg-[#1E2538] px-1.5 py-0.5 rounded-md">Pending Bed</span>
          </div>
          <div className="mt-1.5 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none">{floatingCount} Unassigned</span>
            <span className="text-[9px] font-bold text-slate-400">Requires structural allocation actions</span>
          </div>
        </div>

        {/* Room Placement Allocation Rate Card */}
        <div 
          className="extending-hover-card accent-teal bg-white rounded-2xl p-3.5 flex flex-col justify-between pl-6 overflow-hidden" 
          style={cardShadowStyle}
        >
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Placement Rate</span>
            <span className="text-[9px] font-black uppercase text-teal-100 bg-[#00A896] px-1.5 py-0.5 rounded-md">Operational</span>
          </div>
          <div className="mt-1.5 z-10">
            <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none">{allocationRate}% Settled</span>
            <span className="text-[9px] font-bold text-slate-400">Percentage total beds assigned</span>
          </div>
        </div>

      </div>

      {/* LOWER SPLIT-PANEL: ROSTER CONTAINER REMAINS PERFECTLY SCROLLABLE INTERNALLY */}
      <div className="flex-grow grid grid-cols-12 gap-4 min-h-0 p-1">
        
        {/* LEFT PANEL: ROSTER REGISTER */}
        <div 
          className="extending-hover-card accent-slate col-span-12 lg:col-span-7 bg-white rounded-2xl flex flex-col overflow-hidden pl-1 h-full"
          style={cardShadowStyle}
        >
          {/* Action Filter Block Header */}
          <div className="p-3 bg-white shrink-0 space-y-2">
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search students by profile name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none shadow-inner rounded-xl"
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
              </div>

              <div className="flex gap-1">
                {["All", "Allocated", "Floating"].map((state) => (
                  <button
                    key={state}
                    onClick={() => setFilterState(state)}
                    className={`flex-1 py-1 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                      filterState === state 
                        ? "bg-slate-800 text-white shadow-xs" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CARD ROSTER LIST INTERNAL SCROLLING PRESERVED EXCLUSIVELY */}
          <div className="flex-grow overflow-y-auto custom-scrollbar px-3 pb-2 space-y-1.5 bg-slate-50/50">
            {error && (
              <div className="p-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl text-center">
                ⚠️ {error}
              </div>
            )}

            {processedDisplayRows.length > 0 ? (
              processedDisplayRows.map((student) => (
                <div 
                  key={student._id}
                  className="bg-white rounded-xl py-1.5 px-2.5 flex items-center justify-between gap-3 transition-all hover:shadow-xs"
                >
                  <div className="flex items-center gap-2.5 shrink-0 max-w-[45%]">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-[10px] uppercase">
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
                      <div className="flex items-center bg-teal-50 text-[#00A896] px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide truncate">
                        <Grid size={9} className="mr-0.5 shrink-0" />
                        <span className="truncate">RM {student.roomId.roomNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center bg-slate-100 text-[#1E2538] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap">
                        <HelpCircle size={9} className="mr-0.5 shrink-0" />
                        <span>Floating</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 pl-2">
                    <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5">
                      <button
                        onClick={() => { setSelectedStudent(student); setTargetRoomId(""); setShowTransferModal(true); }}
                        className="text-slate-600 hover:text-teal-600 p-1"
                        title={student.roomId ? "Transfer Room Assignment" : "Assign Available Bed Slot"}
                      >
                        {student.roomId ? <MoveHorizontal size={12} /> : <UserCheck size={12} className="text-[#00A896]" />}
                      </button>
                      
                      {student.roomId && (
                        <button
                          onClick={() => handleEvictFromBed(student._id, student.name)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Unassign from Room Slot"
                        >
                          <UserMinus size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center p-6 rounded-xl bg-white">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No matching profiles</span>
              </div>
            )}
          </div>

          {/* CONTROL FOOTER BAR */}
          <div className="p-2 bg-white shrink-0 flex items-center justify-between text-[9px] font-black text-slate-500 border-t border-slate-100">
            <span className="truncate">Loaded: {totalRosterCount} Total</span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
              >
                <ChevronLeft size={11} />
              </button>
              <span className="whitespace-nowrap">{currentPage} / {paginationData.totalPages || 1}</span>
              <button
                disabled={currentPage >= paginationData.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
              >
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OCCUPANCY RATIO CHART CARD */}
        <div 
          className="extending-hover-card accent-teal col-span-12 lg:col-span-5 bg-white rounded-2xl p-4 flex flex-col justify-between h-full min-h-0 pl-6 select-none overflow-hidden"
          style={cardShadowStyle}
        >
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start w-full z-10 shrink-0">
            Allocation Ratio Analysis
          </h3>

          {/* DONUT CONTAINER */}
          <div className="relative w-full flex items-center justify-center min-h-0 py-4 my-auto z-10 flex-grow">
            {totalRosterCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="88%"
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={270}
                    endAngle={-90}
                    isAnimationActive={false}
                  >
                    {occupancyPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : null}

            {/* Centered Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                {allocationRate}%
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">
                Assigned
              </span>
            </div>
          </div>

          {/* Breakdown Legend Lines Block */}
          <div className="shrink-0 space-y-1 w-full pt-2 z-10 border-t border-slate-100">
            {/* Assigned Row Item */}
            <div className="flex justify-between items-center bg-slate-50/60 rounded-xl px-3 py-1.5 hover:bg-slate-100/70">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]" />
                <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wide">Assigned Profiles</span>
              </div>
              <span className="text-[11px] font-black text-slate-800 tracking-tight">{allocatedCount} Profiles</span>
            </div>

            {/* Floating Row Item */}
            <div className="flex justify-between items-center bg-slate-50/60 rounded-xl px-3 py-1.5 hover:bg-slate-100/70">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E2538]" />
                <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wide">Floating Profiles</span>
              </div>
              <span className="text-[11px] font-black text-slate-800 tracking-tight">{floatingCount} Profiles</span>
            </div>
          </div>
        </div>

      </div>

      {/* OVERLAY OPERATION MODAL */}
      {showTransferModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setShowTransferModal(false); setSelectedStudent(null); }} />
          <form 
            onSubmit={handleTransferSubmit}
            className="bg-white rounded-xl p-4 w-full max-w-sm space-y-3 z-10"
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
                className="w-full bg-slate-50 px-2 py-1.5 text-xs font-bold rounded-lg focus:outline-none"
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
                className="w-1/2 py-1.5 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-slate-200/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-1.5 bg-[#00A896] text-white font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-teal-700 shadow-sm disabled:opacity-50"
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