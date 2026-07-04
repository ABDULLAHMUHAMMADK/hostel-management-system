import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/client.js";
import DotGridBg from "../components/DotGridBg";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  // Student specific parameters
  const [hostelId, setHostelId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [hostelList, setHostelList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [isHostelOpen, setIsHostelOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [selectedHostelName, setSelectedHostelName] = useState("");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");

  // Warden specific parameters
  const [hostelName, setHostelName] = useState("");
  const [hostelLocation, setHostelLocation] = useState("");
  const [totalRooms, setTotalRooms] = useState("");

  const hostelDropdownRef = useRef(null);
  const roomDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        hostelDropdownRef.current &&
        !hostelDropdownRef.current.contains(event.target)
      ) {
        setIsHostelOpen(false);
      }
      if (
        roomDropdownRef.current &&
        !roomDropdownRef.current.contains(event.target)
      ) {
        setIsRoomOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch hostels if role is student
  useEffect(() => {
    const fetchAllHostels = async () => {
      if (role !== "student") return;
      try {
        const response = await API.get("/users/hostels/search");
        if (response.data?.success) {
          setHostelList(response.data.hostels);
        }
      } catch (err) {
        console.error("Failed fetching all hostels:", err.message);
      }
    };
    fetchAllHostels();
  }, [role]);

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      if (!hostelId) {
        setRoomList([]);
        return;
      }
      try {
        const response = await API.get(
          `/users/hostels/${hostelId}/available-rooms`,
        );
        if (response.data?.success) {
          setRoomList(response.data.rooms);
        }
      } catch (err) {
        console.error("Failed loading available rooms list:", err.message);
      }
    };
    fetchRooms();
    setRoomId("");
    setSelectedRoomNumber("");
  }, [hostelId]);

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name,
      email,
      password,
      phone,
      role,
      ...(role === "student" && { hostelId, roomId }),
      ...(role === "warden" && { hostelName, hostelLocation, totalRooms }),
    };

    try {
      const response = await API.post("/users/", payload);
      alert("Registration Successful! Account created.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed. Try again.");
    }
  };

  return (
    <div className="h-screen w-screen relative flex items-center justify-center bg-transparent overflow-hidden">
      <DotGridBg />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 relative z-10 transition-all m-4 shadow-2xl"
        style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
      >
        {/* Branding Title */}
        <div className="text-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-md shadow-teal-600/20">
            H
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Join the Hostel Management System
          </p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4 ">
          {/* Universal Core Fields Grid Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                required
                placeholder="John Doe"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                required
                placeholder="name@hostel.com"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1234567890"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                required
              />
            </div>

            <div
              className={
                role !== "student" && role !== "warden" ? "sm:col-span-2" : ""
              }
            >
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                Select User Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-bold shadow-sm cursor-pointer"
              >
                <option value="none">none</option>
                <option value="student">Student</option>
                <option value="warden">Hostel Warden</option>
              </select>
            </div>
          </div>

          {/* Conditional Role-Based Row Elements */}
          <AnimatePresence mode="wait">
            {role === "student" && (
              <motion.div
                key="student-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
              >
                {/* HOSTEL DROPDOWN - Updated to match Room dropdown style (simple clickable) */}
                <div className="relative" ref={hostelDropdownRef}>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Hostel
                  </label>
                  <div
                    onClick={() => setIsHostelOpen(!isHostelOpen)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-teal-500 cursor-pointer flex justify-between items-center transition-all shadow-sm hover:border-teal-400"
                  >
                    <span
                      className={
                        selectedHostelName
                          ? "text-slate-900 font-bold truncate"
                          : "text-slate-400 truncate font-semibold"
                      }
                    >
                      {selectedHostelName || "-- Select Hostel --"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${isHostelOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {isHostelOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <ul className="max-h-28 overflow-y-auto space-y-0.5">
                        {hostelList.length === 0 ? (
                          <li className="text-xs text-slate-400 text-center py-2">
                            No hostels available
                          </li>
                        ) : (
                          hostelList.map((h) => (
                            <li
                              key={h._id}
                              onClick={() => {
                                setHostelId(h._id);
                                setSelectedHostelName(h.name);
                                setIsHostelOpen(false);
                              }}
                              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-slate-800 hover:bg-teal-50 hover:text-teal-700 font-bold transition-colors"
                            >
                              {h.name}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ROOM DROPDOWN - Keep as is with search/filter */}
                <div className="relative" ref={roomDropdownRef}>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Available Rooms
                  </label>
                  <div
                    onClick={() => {
                      if (hostelId && roomList.length > 0) {
                        setIsRoomOpen(!isRoomOpen);
                      }
                    }}
                    className={`w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-teal-500 cursor-pointer flex justify-between items-center transition-all shadow-sm ${
                      !hostelId || roomList.length === 0
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-teal-400"
                    }`}
                  >
                    <span
                      className={
                        selectedRoomNumber
                          ? "text-slate-900 font-bold truncate"
                          : "text-slate-400 truncate font-semibold"
                      }
                    >
                      {!hostelId
                        ? "Choose hostel first"
                        : roomList.length === 0
                          ? "⚠️ No rooms available"
                          : selectedRoomNumber || "-- Select Room --"}
                    </span>
                    {hostelId && roomList.length > 0 && (
                      <svg
                        className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${isRoomOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                  {isRoomOpen && hostelId && roomList.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <ul className="max-h-28 overflow-y-auto space-y-0.5">
                        {roomList.map((room) => (
                          <li
                            key={room._id}
                            onClick={() => {
                              setRoomId(room._id);
                              setSelectedRoomNumber(
                                `Room ${room.roomNumber} (${room.maxCapicity - room.occupants.length} open beds)`,
                              );
                              setIsRoomOpen(false);
                            }}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-slate-800 hover:bg-teal-50 hover:text-teal-700 font-bold transition-colors"
                          >
                            Room {room.roomNumber} (
                            {room.maxCapicity - room.occupants.length} open
                            beds)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* --- WARDEN CONDITIONAL INPUT ROW FIELDS --- */}
            {role === "warden" && (
              <motion.div
                key="warden-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                    required
                    placeholder="e.g., Boys Luxury Wing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Location Area
                  </label>
                  <input
                    type="text"
                    value={hostelLocation}
                    onChange={(e) => setHostelLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                    required
                    placeholder="e.g., Sector 4 Block C"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
                    required
                    placeholder="e.g., 50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-500 transition-all active:scale-[0.99] mt-2 cursor-pointer"
          >
            Register Account
          </button>
        </form>

        <div className="text-center mt-5 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-teal-600 font-bold hover:text-teal-500 hover:underline cursor-pointer transition-all"
            >
              Sign In here
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}




