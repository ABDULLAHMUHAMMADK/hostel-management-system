import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/client";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  LogOut, 
  CheckCircle, 
  Save, 
  Building,
  KeyRound,
  AlertTriangle,
  MapPin,
  Edit3,
  X,
  Users
} from "lucide-react";

export default function WardenProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Core Layout States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Data States
  const [dashboardData, setDashboardData] = useState({
    name: "", email: "", phone: "", role: "",
    hostelName: "", hostelLocation: "", totalRooms: 0, studentCount: 0
  });

  // Edit Form Buffers
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [hostelForm, setHostelForm] = useState({ name: "", location: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isDirty, setIsDirty] = useState(false);

  const fetchProfileAndHostel = async () => {
    try {
      setLoading(true);
      const response = await API.get("/hostel/hostel-profile");
      if (response.data?.success) {
        const payload = response.data.data;
        const linkedHostel = payload.hostelId;

        const dynamicData = {
          name: payload.name || "",
          email: payload.email || "",
          phone: payload.phone || "",
          role: payload.role || "warden",
          hostelName: linkedHostel?.name || "Unassigned Facility",
          hostelLocation: linkedHostel?.location || "No Location Specified",
          totalRooms: linkedHostel?.totalRooms || 0,
          studentCount: linkedHostel?.studentCount || 0
        };

        setDashboardData(dynamicData);
        
        // Synchronize state buffers for forms
        setProfileForm({ name: dynamicData.name, email: dynamicData.email, phone: dynamicData.phone });
        setHostelForm({ name: dynamicData.hostelName, location: dynamicData.hostelLocation });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load system identity records." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndHostel();
  }, []);

  const handleInputChange = (e, setForm) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await API.put("/users/profile/update", profileForm);
      if (response.data?.success) {
        setMessage({ type: "success", text: "Profile details updated successfully." });
        setIsDirty(false);
        fetchProfileAndHostel();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHostel = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await API.put("/hostel/update-hostel", hostelForm);
      if (response.data?.success) {
        setMessage({ type: "success", text: "Hostel facility configuration updated." });
        setIsDirty(false);
        fetchProfileAndHostel();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to alter hostel setups." });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await API.put("/users/profile/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      if (response.data?.success) {
        setMessage({ type: "success", text: "Security vault passcodes updated successfully." });
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Password switch rejected." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full max-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-[calc(100vh-80px)] p-6 overflow-y-auto font-sans bg-slate-50 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-6 my-auto">
        
        {/* TOP LEVEL HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Profile</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Overview of active identity metadata and assigned property details.</p>
          </div>
          <button
            onClick={() => { setIsEditModalOpen(true); setMessage({ type: "", text: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Facility & Profile
          </button>
        </div>

        {/* PROFILE VISUAL DATA GRID SPLIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: ACCOUNT & WARDEN SPECIFICS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-slate-800">
              <User size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Warden Credentials</h3>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Full Name</span>
                <span className="text-sm font-semibold text-slate-800">{dashboardData.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">System Email</span>
                <span className="text-sm font-semibold text-slate-800">{dashboardData.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Contact Phone Line</span>
                <span className="text-sm font-semibold text-slate-800">{dashboardData.phone || "Not Configured"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Access Level Role</span>
                <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded uppercase">
                  {dashboardData.role}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: ASSIGNED PROPERTY SCHEMATICS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-slate-800">
              <Building size={16} className="text-teal-600" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Assigned Facility Details</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Hostel Identity Name</span>
                <span className="text-sm font-semibold text-slate-800">{dashboardData.hostelName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Physical Location Map Block</span>
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  {dashboardData.hostelLocation}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Rooms</span>
                  <span className="text-lg font-bold text-slate-800">{dashboardData.totalRooms}</span>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-2.5 text-center">
                  <span className="text-[9px] font-bold text-indigo-400 block uppercase flex items-center justify-center gap-1">
                    <Users size={10} /> Active Students
                  </span>
                  <span className="text-lg font-bold text-indigo-700">{dashboardData.studentCount}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* LOGOUT FOOTER ACTION BUTTON */}
        <div className="flex justify-end pt-2">
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-2 py-2 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <LogOut size={13} />
            Terminate Active Session
          </button>
        </div>

      </div>

      {/* FULL-OVERLAY CONFIGURATION MODAL DIALOGUE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white border border-slate-200 w-full max-w-lg h-[460px] rounded-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* MODAL NAVIGATION */}
            <div className="flex items-center justify-between border-b border-slate-100 p-3 bg-slate-50/50 shrink-0">
              <div className="flex gap-1.5 bg-slate-200/60 p-0.5 rounded-md">
                {[
                  { id: "details", label: "Profile Details", icon: <User size={13} /> },
                  { id: "hostel", label: "Hostel Setup", icon: <Building size={13} /> },
                  { id: "security", label: "Security Keys", icon: <Shield size={13} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setMessage({ type: "", text: "" }); setIsDirty(false); }}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-sm text-xs font-semibold transition-all duration-200 ${
                      activeTab === tab.id ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* MODAL MAIN DYNAMIC CORE FORM SCROLL BOX */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-white overflow-hidden">
              <div className="space-y-3 w-full overflow-y-auto pr-0.5 max-h-full">
                
                {message.text && (
                  <div className={`p-2.5 border rounded-md text-xs font-semibold flex items-center gap-2.5 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {message.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    <div className="leading-tight">{message.text}</div>
                  </div>
                )}

                {activeTab === "details" && (
                  <form onSubmit={handleSaveDetails} className="space-y-3 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Administrative Name</label>
                        <div className="relative"><input type="text" name="name" value={profileForm.name} onChange={(e) => handleInputChange(e, setProfileForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" /><User size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Email Address</label>
                        <div className="relative"><input type="email" name="email" value={profileForm.email} onChange={(e) => handleInputChange(e, setProfileForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" /><Mail size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Contact Number</label>
                        <div className="relative"><input type="text" name="phone" value={profileForm.phone} onChange={(e) => handleInputChange(e, setProfileForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" /><Phone size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                    </div>
                    <button type="submit" disabled={saving || !isDirty} className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md disabled:opacity-40 flex items-center justify-center gap-2"><Save size={13} />{saving ? "Saving Changes..." : "Commit Profile Changes"}</button>
                  </form>
                )}

                {activeTab === "hostel" && (
                  <form onSubmit={handleSaveHostel} className="space-y-3 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Hostel Identity Name</label>
                        <div className="relative"><input type="text" name="name" value={hostelForm.name} onChange={(e) => handleInputChange(e, setHostelForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" /><Building size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Physical Location Area</label>
                        <div className="relative"><input type="text" name="location" value={hostelForm.location} onChange={(e) => handleInputChange(e, setHostelForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" /><MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                    </div>
                    <button type="submit" disabled={saving || !isDirty} className="w-full mt-12 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md disabled:opacity-40 flex items-center justify-center gap-2"><Save size={13} />{saving ? "Updating Property Details..." : "Commit Hostel Changes"}</button>
                  </form>
                )}

                {activeTab === "security" && (
                  <form onSubmit={handleSavePassword} className="space-y-3 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Current Password</label>
                        <div className="relative"><input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={(e) => handleInputChange(e, setPasswordForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" placeholder="••••••••" /><Lock size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">New Password</label>
                        <div className="relative"><input type="password" name="newPassword" value={passwordForm.newPassword} onChange={(e) => handleInputChange(e, setPasswordForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" placeholder="••••••••" /><KeyRound size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Confirm Password</label>
                        <div className="relative"><input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={(e) => handleInputChange(e, setPasswordForm)} className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-800" placeholder="••••••••" /><KeyRound size={14} className="absolute left-3 top-2.5 text-slate-400" /></div>
                      </div>
                    </div>
                    <button type="submit" disabled={saving || !passwordForm.oldPassword || !passwordForm.newPassword} className="w-full mt-4 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md disabled:opacity-40 flex items-center justify-center gap-2"><CheckCircle size={13} />Update passwords</button>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}