// import React, { useState, useEffect } from "react";
// import { 
//   Wallet, 
//   CheckCircle, 
//   Clock, 
//   Users, 
//   RefreshCw, 
//   PlusCircle,
//   AlertCircle,
//   X
// } from "lucide-react";
// import API from "../../api/client";

// export default function WardenFees() {
//   const [activeTab, setActiveTab] = useState("hostel");
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");

//   // Section 1: Warden's Own Rent Data
//   const [myInvoices, setMyInvoices] = useState([]);
//   const [hostelStats, setHostelStats] = useState({ unpaid: 0, paid: 0 });

//   // Section 2: Student Fee Data
//   const [defaulters, setDefaulters] = useState([]);
//   const [studentStats, setStudentStats] = useState({ unpaid: 0, paid: 0 });

//   // 🆕 Fee Initialization Modal State
//   const [showInitModal, setShowInitModal] = useState(false);
//   const [initAmount, setInitAmount] = useState(500);
//   const [initMonth, setInitMonth] = useState("");
//   const [initLoading, setInitLoading] = useState(false);
//   const [initResult, setInitResult] = useState(null);

//   const cardShadow = { boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" };

//   const loadAllFeeData = async () => {
//     try {
//       setLoading(true);
//       setErrorMessage("");

//       const [statsRes, defaultersRes, rentRes] = await Promise.all([
//         API.get("/fee/fee-stats"),
//         API.get("/fee/defulters"),
//         API.get("/hostel/my-rent-invoices").catch(() => ({ data: { success: false } }))
//       ]);

//       if (statsRes.data?.success) {
//         let paidAmt = 0;
//         let unpaidAmt = 0;
//         statsRes.data.stats.forEach((item) => {
//           if (item._id === "paid") paidAmt = item.totalAmount;
//           if (item._id === "pending") unpaidAmt = item.totalAmount;
//         });
//         setStudentStats({ paid: paidAmt, unpaid: unpaidAmt });
//       }

//       if (defaultersRes.data?.success) {
//         setDefaulters(defaultersRes.data.data || []);
//       }

//       if (rentRes.data?.success) {
//         setMyInvoices(rentRes.data.invoices || []);
//         setHostelStats(rentRes.data.stats || { unpaid: 0, paid: 0 });
//       }

//     } catch (err) {
//       console.error(err);
//       setErrorMessage("Could not load fee records. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAllFeeData();
//   }, []);

//   // 🆕 Handle Fee Initialization
//   const handleInitializeFees = async (e) => {
//     e.preventDefault();
//     if (!initMonth || initAmount <= 0) {
//       alert("Please select a month and enter a valid amount.");
//       return;
//     }

//     setInitLoading(true);
//     setInitResult(null);

//     try {
//       // Get current hostel ID from user context or localStorage
//       const hostelId = localStorage.getItem("hostelId") || "your-hostel-id-here";
      
//       const response = await API.post("/fee/generate-fee", {
//         hostelId,
//         amount: initAmount,
//         month: initMonth
//       });

//       if (response.data?.success) {
//         setInitResult({
//           success: true,
//           message: response.data.message,
//           generated: response.data.generated || 0,
//           total: response.data.total || 0,
//           alreadyHad: response.data.alreadyHad || 0
//         });
        
//         // Refresh data after successful generation
//         setTimeout(() => {
//           loadAllFeeData();
//           setShowInitModal(false);
//           setInitResult(null);
//         }, 2000);
//       }
//     } catch (err) {
//       setInitResult({
//         success: false,
//         message: err.response?.data?.message || "Failed to generate fees."
//       });
//     } finally {
//       setInitLoading(false);
//     }
//   };

//   const handlePayHostelRent = async (feeId) => {
//     try {
//       const res = await API.post("/hostel/warden-pay-fee", { feeId });
//       if (res.data?.success && res.data.url) {
//         window.location.href = res.data.url;
//       }
//     } catch (err) {
//       alert("Payment checkout failed. Try again.");
//     }
//   };

//   const handlePayForStudent = async (feeId, studentId) => {
//     try {
//       const res = await API.post("/hostel/warden-pay-fee", { feeId, studentId });
//       if (res.data?.success && res.data.url) {
//         window.location.href = res.data.url;
//       }
//     } catch (err) {
//       alert("Student checkout failed.");
//     }
//   };

//   // Get current month for default value
//   const getCurrentMonth = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
//         <div className="grid grid-cols-2 gap-4">
//           <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
//           <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
//         </div>
//         <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6 max-w-[1400px] mx-auto select-none font-sans">
      
//       {/* TOP HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Fee System</h1>
//           <p className="text-xs font-semibold text-slate-400">Manage your bills and track student dues</p>
//         </div>
//         <button 
//           onClick={loadAllFeeData} 
//           className="p-2 bg-white rounded-lg text-slate-400 hover:text-slate-600 border border-slate-200 shadow-sm transition-all hover:shadow-md"
//         >
//           <RefreshCw size={14} />
//         </button>
//       </div>

//       {errorMessage && (
//         <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
//           ⚠️ {errorMessage}
//         </div>
//       )}

//       {/* HORIZONTAL TAB SELECTOR */}
//       <div className="flex border-b border-slate-200 gap-6">
//         <button 
//           onClick={() => setActiveTab("hostel")}
//           className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-1 ${
//             activeTab === "hostel" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
//           }`}
//         >
//           My Hostel Rent
//         </button>
//         <button 
//           onClick={() => setActiveTab("students")}
//           className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-1 ${
//             activeTab === "students" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
//           }`}
//         >
//           Student Fees & Dues
//         </button>
//       </div>

//       {/* 🏢 SECTION 1: MY HOSTEL RENT PANEL */}
//       {activeTab === "hostel" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between" style={cardShadow}>
//               <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
//                 <Wallet size={12} /> My Pending Rent
//               </span>
//               <h2 className="text-2xl font-black text-slate-900 mt-1">${hostelStats.unpaid}</h2>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between" style={cardShadow}>
//               <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
//                 <CheckCircle size={12} /> Total Paid Rent
//               </span>
//               <h2 className="text-2xl font-black text-slate-900 mt-1">${hostelStats.paid}</h2>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden" style={cardShadow}>
//             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
//               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hostel Rent Bills</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
//                     <th className="py-3 px-4">Billing Month</th>
//                     <th className="py-3 px-4">Amount</th>
//                     <th className="py-3 px-4">Status</th>
//                     <th className="py-3 px-4 text-right">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-xs divide-y divide-slate-100 text-slate-600 font-medium">
//                   {myInvoices.length === 0 ? (
//                     <tr><td colSpan="4" className="py-6 text-center text-slate-400 font-bold">No rent bills found.</td></tr>
//                   ) : (
//                     myInvoices.map((inv) => (
//                       <tr key={inv._id} className="hover:bg-slate-50/40">
//                         <td className="py-3.5 px-4 font-bold text-slate-800">{inv.month}</td>
//                         <td className="py-3.5 px-4 font-black text-slate-900">${inv.amount}</td>
//                         <td className="py-3.5 px-4">
//                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
//                             inv.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
//                           }`}>
//                             {inv.status}
//                           </span>
//                         </td>
//                         <td className="py-3.5 px-4 text-right">
//                           {inv.status === "pending" ? (
//                             <button 
//                               onClick={() => handlePayHostelRent(inv._id)} 
//                               className="px-3 py-1 bg-teal-600 text-white text-[10px] font-bold uppercase rounded hover:bg-teal-500 transition-all"
//                             >
//                               Pay Bill
//                             </button>
//                           ) : (
//                             <span className="text-[10px] text-emerald-600 font-bold uppercase">Paid ✓</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 👤 SECTION 2: STUDENT HOSTEL FEES PANEL */}
//       {activeTab === "students" && (
//         <div className="space-y-6">
//           {/* STUDENT AGGREGATED STATS */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between" style={cardShadow}>
//               <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
//                 <Clock size={12} /> Total Pending (Arrears)
//               </span>
//               <h2 className="text-2xl font-black text-red-600 mt-1">${studentStats.unpaid}</h2>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between" style={cardShadow}>
//               <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
//                 <Users size={12} /> Total Student Paid
//               </span>
//               <h2 className="text-2xl font-black text-emerald-600 mt-1">${studentStats.paid}</h2>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between" style={cardShadow}>
//               <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
//                 <AlertCircle size={12} /> Active Students
//               </span>
//               <h2 className="text-2xl font-black text-slate-800 mt-1">{defaulters.length || 0}</h2>
//             </div>
//           </div>

//           {/* 🆕 INITIALIZE FEE BUTTON */}
//           <div className="flex justify-end">
//             <button
//               onClick={() => {
//                 setInitMonth(getCurrentMonth());
//                 setInitResult(null);
//                 setShowInitModal(true);
//               }}
//               className="flex items-center gap-2 px-4 py-2 bg-[#00a896] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-all shadow-md"
//             >
//               <PlusCircle size={14} /> Initialize Monthly Fees
//             </button>
//           </div>

//           {/* STUDENT DEFAULTERS TABLE */}
//           <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden" style={cardShadow}>
//             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unpaid Student Invoices</h3>
//               <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
//                 {defaulters.length} Pending
//               </span>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
//                     <th className="py-3 px-4">Student Name</th>
//                     <th className="py-3 px-4">Room Number</th>
//                     <th className="py-3 px-4">Bill Month</th>
//                     <th className="py-3 px-4">Amount</th>
//                     <th className="py-3 px-4">Status</th>
//                     <th className="py-3 px-4 text-right">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-xs divide-y divide-slate-100 text-slate-600 font-medium">
//                   {defaulters.length === 0 ? (
//                     <tr><td colSpan="6" className="py-8 text-center text-slate-400 font-bold">🎉 Awesome! No pending student bills found.</td></tr>
//                   ) : (
//                     defaulters.map((fee) => (
//                       <tr key={fee._id} className="hover:bg-slate-50/40">
//                         <td className="py-3.5 px-4 font-bold text-slate-800">
//                           {fee.studentId?.name || "Unknown Student"}
//                         </td>
//                         <td className="py-3.5 px-4 text-slate-500 font-semibold">
//                           Room {fee.studentId?.roomId?.roomNumber || fee.roomNumber || "N/A"}
//                         </td>
//                         <td className="py-3.5 px-4 text-slate-400 font-bold">
//                           {fee.month || "Current Month"}
//                         </td>
//                         <td className="py-3.5 px-4 font-black text-slate-900">${fee.amount}</td>
//                         <td className="py-3.5 px-4">
//                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600">
//                             Pending
//                           </span>
//                         </td>
//                         <td className="py-3.5 px-4 text-right">
//                           <button 
//                             onClick={() => handlePayForStudent(fee._id, fee.studentId?._id)} 
//                             className="px-3 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase rounded hover:bg-slate-700 transition-all"
//                           >
//                             Pay For Student
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🆕 INITIALIZE FEE MODAL */}
//       {showInitModal && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200" style={cardShadow}>
//             <div className="flex justify-between items-start mb-4">
//               <div>
//                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
//                   <PlusCircle size={16} className="text-[#00a896]" /> Initialize Monthly Fees
//                 </h3>
//                 <p className="text-[10px] text-slate-400 font-medium mt-0.5">
//                   Generate bills for students who don't have fees for this month
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowInitModal(false);
//                   setInitResult(null);
//                 }}
//                 className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <X size={18} className="text-slate-400" />
//               </button>
//             </div>

//             <form onSubmit={handleInitializeFees} className="space-y-4">
//               <div>
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
//                   Billing Month
//                 </label>
//                 <input
//                   type="month"
//                   required
//                   value={initMonth}
//                   onChange={(e) => setInitMonth(e.target.value)}
//                   className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
//                 />
//               </div>

//               <div>
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
//                   Fee Amount ($)
//                 </label>
//                 <input
//                   type="number"
//                   required
//                   min="1"
//                   step="1"
//                   value={initAmount}
//                   onChange={(e) => setInitAmount(Number(e.target.value))}
//                   className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
//                   placeholder="Enter amount..."
//                 />
//               </div>

//               {/* Result Display */}
//               {initResult && (
//                 <div className={`p-3 rounded-xl text-xs font-bold ${
//                   initResult.success 
//                     ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
//                     : 'bg-red-50 border border-red-200 text-red-700'
//                 }`}>
//                   {initResult.message}
//                   {initResult.success && initResult.generated !== undefined && (
//                     <div className="mt-1 text-[10px] font-medium space-y-0.5">
//                       <div>✅ Generated: {initResult.generated} new bills</div>
//                       <div>📋 Already had bills: {initResult.alreadyHad || 0} students</div>
//                       <div>👥 Total students: {initResult.total || 0}</div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               <div className="flex items-center gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowInitModal(false);
//                     setInitResult(null);
//                   }}
//                   className="w-1/2 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
//                   disabled={initLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={initLoading}
//                   className="w-1/2 py-2 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {initLoading ? "Generating..." : "Generate Bills"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  CheckCircle, 
  Clock, 
  Users, 
  RefreshCw, 
  PlusCircle,
  AlertCircle,
  X
} from "lucide-react";
import API from "../../api/client";

export default function WardenFees() {
  const [activeTab, setActiveTab] = useState("hostel");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Section 1: Warden's Own Rent Data
  const [myInvoices, setMyInvoices] = useState([]);
  const [hostelStats, setHostelStats] = useState({ unpaid: 0, paid: 0 });

  // Section 2: Student Fee Data
  const [defaulters, setDefaulters] = useState([]);
  const [studentStats, setStudentStats] = useState({ unpaid: 0, paid: 0 });

  // Fee Initialization Modal State
  const [showInitModal, setShowInitModal] = useState(false);
  const [initAmount, setInitAmount] = useState(500);
  const [initMonth, setInitMonth] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [initResult, setInitResult] = useState(null);

  const cardShadow = { boxShadow: "rgba(0, 0, 0, 0.06) 0px 4px 12px" };

  // 🎯 Reusable individual card style with fully curved right corners on the left indicator line
  const individualCardClass = "relative overflow-hidden bg-white p-6 rounded-xl border border-slate-200/60 transition-all duration-300 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[4px] before:h-[20%] before:bg-teal-600 before:rounded-r-full before:transition-all before:duration-300 hover:before:h-full hover:before:top-1/2";

  const loadAllFeeData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [statsRes, defaultersRes, rentRes] = await Promise.all([
        API.get("/fee/fee-stats"),
        API.get("/fee/defulters"),
        API.get("/hostel/my-rent-invoices").catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success) {
        let paidAmt = 0;
        let unpaidAmt = 0;
        statsRes.data.stats.forEach((item) => {
          if (item._id === "paid") paidAmt = item.totalAmount;
          if (item._id === "pending") unpaidAmt = item.totalAmount;
        });
        setStudentStats({ paid: paidAmt, unpaid: unpaidAmt });
      }

      if (defaultersRes.data?.success) {
        setDefaulters(defaultersRes.data.data || []);
      }

      if (rentRes.data?.success) {
        setMyInvoices(rentRes.data.invoices || []);
        setHostelStats(rentRes.data.stats || { unpaid: 0, paid: 0 });
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("Could not load fee records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFeeData();
  }, []);

  const handleInitializeFees = async (e) => {
    e.preventDefault();
    if (!initMonth || initAmount <= 0) {
      alert("Please select a month and enter a valid amount.");
      return;
    }

    setInitLoading(true);
    setInitResult(null);

    try {
      const hostelId = localStorage.getItem("hostelId") || "your-hostel-id-here";
      
      const response = await API.post("/fee/generate-fee", {
        hostelId,
        amount: initAmount,
        month: initMonth
      });

      if (response.data?.success) {
        setInitResult({
          success: true,
          message: response.data.message,
          generated: response.data.generated || 0,
          total: response.data.total || 0,
          alreadyHad: response.data.alreadyHad || 0
        });
        
        setTimeout(() => {
          loadAllFeeData();
          setShowInitModal(false);
          setInitResult(null);
        }, 2000);
      }
    } catch (err) {
      setInitResult({
        success: false,
        message: err.response?.data?.message || "Failed to generate fees."
      });
    } finally {
      setInitLoading(false);
    }
  };

  const handlePayHostelRent = async (feeId) => {
    try {
      const res = await API.post("/hostel/warden-pay-fee", { feeId });
      if (res.data?.success && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert("Payment checkout failed. Try again.");
    }
  };

  const handlePayForStudent = async (feeId, studentId) => {
    try {
      const res = await API.post("/hostel/warden-pay-fee", { feeId, studentId });
      if (res.data?.success && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert("Student checkout failed.");
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto select-none font-sans">
      
      {/* TOP HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Fee System</h1>
          <p className="text-xs font-semibold text-slate-400">Manage your bills and track student dues</p>
        </div>
        <button 
          onClick={loadAllFeeData} 
          className="p-2 bg-white rounded-lg text-slate-400 hover:text-slate-600 border border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* HORIZONTAL TAB SELECTOR */}
      <div className="flex border-b border-slate-200 gap-6">
        <button 
          onClick={() => setActiveTab("hostel")}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-1 ${
            activeTab === "hostel" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          My Hostel Rent
        </button>
        <button 
          onClick={() => setActiveTab("students")}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-1 ${
            activeTab === "students" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Student Fees & Dues
        </button>
      </div>

      {/* 🏢 VIEW 1: HOSTEL RENT INDIVIDUAL BLOCKS */}
      {activeTab === "hostel" && (
        <div className="space-y-6">
          
          {/* STATS AREA - SEPARATED CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={individualCardClass} style={cardShadow}>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Wallet size={12} /> My Pending Rent
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">${hostelStats.unpaid}</h2>
            </div>
            <div className={individualCardClass} style={cardShadow}>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <CheckCircle size={12} /> Total Paid Rent
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">${hostelStats.paid}</h2>
            </div>
          </div>

          {/* TABLE AREA - SEPARATED CARD */}
          <div className={individualCardClass} style={cardShadow}>
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hostel Rent Bills</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 text-slate-600 font-medium">
                  {myInvoices.length === 0 ? (
                    <tr><td colSpan="4" className="py-6 text-center text-slate-400 font-bold">No rent bills found.</td></tr>
                  ) : (
                    myInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{inv.month}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">${inv.amount}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {inv.status === "pending" ? (
                            <button 
                              onClick={() => handlePayHostelRent(inv._id)} 
                              className="px-3 py-1 bg-teal-600 text-white text-[10px] font-bold uppercase rounded hover:bg-teal-500 transition-all"
                            >
                              Pay Bill
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Paid ✓</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 👤 VIEW 2: STUDENT FEE INDIVIDUAL BLOCKS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          
          {/* STATS AREA - SEPARATED CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={individualCardClass} style={cardShadow}>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Clock size={12} /> Total Pending (Arrears)
              </span>
              <h2 className="text-2xl font-black text-red-600 mt-1">${studentStats.unpaid}</h2>
            </div>
            <div className={individualCardClass} style={cardShadow}>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Users size={12} /> Total Student Paid
              </span>
              <h2 className="text-2xl font-black text-emerald-600 mt-1">${studentStats.paid}</h2>
            </div>
            <div className={individualCardClass} style={cardShadow}>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <AlertCircle size={12} /> Active Students
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-1">{defaulters.length || 0}</h2>
            </div>
          </div>

          {/* INITIALIZE ACTION CONTROL CARD */}
          <div className={individualCardClass} style={cardShadow}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Billing Operational Actions</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Initialize a new collection cycle for active occupants:</p>
              </div>
              <button
                onClick={() => {
                  setInitMonth(getCurrentMonth());
                  setInitResult(null);
                  setShowInitModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#00a896] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-all shadow-md"
              >
                <PlusCircle size={14} /> Initialize Monthly Fees
              </button>
            </div>
          </div>

          {/* TABLE DATA LIST CARD */}
          <div className={individualCardClass} style={cardShadow}>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unpaid Student Invoices</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {defaulters.length} Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Room Number</th>
                    <th className="py-3 px-4">Bill Month</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 text-slate-600 font-medium">
                  {defaulters.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400 font-bold">🎉 Awesome! No pending student bills found.</td></tr>
                  ) : (
                    defaulters.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {fee.studentId?.name || "Unknown Student"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">
                          Room {fee.studentId?.roomId?.roomNumber || fee.roomNumber || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-bold">
                          {fee.month || "Current Month"}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">${fee.amount}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600">
                            Pending
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => handlePayForStudent(fee._id, fee.studentId?._id)} 
                            className="px-3 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase rounded hover:bg-slate-700 transition-all"
                          >
                            Pay For Student
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* INITIALIZE FEE MODAL */}
      {showInitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200" style={cardShadow}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <PlusCircle size={16} className="text-[#00a896]" /> Initialize Monthly Fees
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Generate bills for students who don't have fees for this month
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInitModal(false);
                  setInitResult(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleInitializeFees} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Billing Month
                </label>
                <input
                  type="month"
                  required
                  value={initMonth}
                  onChange={(e) => setInitMonth(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Fee Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={initAmount}
                  onChange={(e) => setInitAmount(Number(e.target.value))}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                  placeholder="Enter amount..."
                />
              </div>

              {initResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  initResult.success 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {initResult.message}
                  {initResult.success && initResult.generated !== undefined && (
                    <div className="mt-1 text-[10px] font-medium space-y-0.5">
                      <div>✅ Generated: {initResult.generated} new bills</div>
                      <div>📋 Already had bills: {initResult.alreadyHad || 0} students</div>
                      <div>👥 Total students: {initResult.total || 0}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInitModal(false);
                    setInitResult(null);
                  }}
                  className="w-1/2 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
                  disabled={initLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={initLoading}
                  className="w-1/2 py-2 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initLoading ? "Generating..." : "Generate Bills"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}