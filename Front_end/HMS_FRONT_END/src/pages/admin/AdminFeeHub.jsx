import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  DollarSign, 
  Wallet, 
  Layers, 
  CheckCircle, 
  Clock, 
  Plus, 
  RefreshCw,
  X,
  AlertCircle,
  Users,
  Building2
} from "lucide-react";
import API from "../../api/client";

export default function AdminFeeHub() {
  const [matrix, setMatrix] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Invoice Generation State
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [initResult, setInitResult] = useState(null);

  const heavySystemShadow = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      const [matrixRes, invoiceRes] = await Promise.all([
        API.get("/admin/dashboard-matrix"),
        API.get("/admin/billing/invoices")
      ]);

      if (matrixRes.data?.success) setMatrix(matrixRes.data.data.corporateBilling);
      if (invoiceRes.data?.success) setInvoices(invoiceRes.data.data);
    } catch (err) {
      console.error("Error updating fee hub data pipeline:", err);
      setErrorMessage("Failed to sync current multi-tenant corporate billing states.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    
    if (!month || !amount || amount <= 0) {
      setErrorMessage("Please select a month and enter a valid amount.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setInitResult(null);

    try {
      const res = await API.post("/admin/billing/generate", { 
        amount: Number(amount), 
        month 
      });
      
      if (res.data?.success) {
        setInitResult({
          success: true,
          message: res.data.message,
          generated: res.data.generated || 0,
          total: res.data.total || 0,
          alreadyHad: res.data.alreadyHad || 0,
          hostelCount: res.data.hostelCount || 0
        });
        
        setSuccessMessage(res.data.message);
        setAmount("");
        setMonth("");
        
        // Refresh data after successful generation
        setTimeout(() => {
          fetchData();
          setShowModal(false);
          setInitResult(null);
        }, 3000);
      }
    } catch (err) {
      setInitResult({
        success: false,
        message: err.response?.data?.message || "Generation sequence failure."
      });
      setErrorMessage(err.response?.data?.message || "Generation sequence failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    if (!window.confirm("Confirm manual collection settlement for this warden invoice?")) return;
    try {
      const res = await API.put("/admin/billing/record-payment", { invoiceId });
      if (res.data?.success) {
        fetchData();
      }
    } catch (err) {
      setErrorMessage("Failed to update status parameters.");
    }
  };

  // Get current month for default value
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Corporate Fee Hub</h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Manage warden platform rent pipelines, issue global invoices and process collections
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            style={heavySystemShadow}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => {
              setMonth(getCurrentMonth());
              setInitResult(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#00a896] text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-teal-700 transition-colors cursor-pointer shadow-md"
            style={heavySystemShadow}
          >
            <Plus size={14} /> Generate Month Billing
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs rounded-xl">
          ⚠️ {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs rounded-xl">
          ✅ {successMessage}
        </div>
      )}

      {/* FINANCIAL OVERVIEW 4-COLUMN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Outstanding Dues */}
        <div className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-amber-500 h-[46%] rounded-r transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Wallet size={12} className="text-amber-500" /> Outstanding Money
            </p>
            <h2 className="text-2xl font-black text-slate-900">${matrix?.outstandingBalance?.toLocaleString() || 0}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"><Wallet size={18} /></div>
        </div>

        {/* Total Paid Money */}
        <div className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-emerald-500 h-[46%] rounded-r transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-500" /> Total Paid Money
            </p>
            <h2 className="text-2xl font-black text-slate-900">${matrix?.revenueCollected?.toLocaleString() || 0}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><DollarSign size={18} /></div>
        </div>

        {/* Total Paid Invoices Count */}
        <div className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-indigo-600 h-[46%] rounded-r transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <CheckCircle size={12} className="text-indigo-500" /> Paid Invoices
            </p>
            <h2 className="text-2xl font-black text-slate-900">{matrix?.paidInvoices || 0} <span className="text-xs text-slate-400 font-bold">Invoices</span></h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><CheckCircle size={18} /></div>
        </div>

        {/* Total Unpaid Invoices Count */}
        <div className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-rose-500 h-[46%] rounded-r transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Clock size={12} className="text-rose-500" /> Unpaid Invoices
            </p>
            <h2 className="text-2xl font-black text-slate-900">{matrix?.pendingInvoices || 0} <span className="text-xs text-slate-400 font-bold">Unpaid</span></h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0"><Clock size={18} /></div>
        </div>

      </div>

      {/* LEDGER DATA LIST TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden p-6" style={heavySystemShadow}>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" /> Tenant Fee Ledger Statements
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Warden Operating Tenant</th>
                <th className="pb-3">Managed Hostel Wing</th>
                <th className="pb-3">Billing Month</th>
                <th className="pb-3">Amount Due</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50 font-medium text-slate-600">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center font-bold text-slate-400">
                    No corporate statement parameters tracked in database logs.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="font-bold text-slate-800">{inv.wardenId?.name || "Unassigned"}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{inv.wardenId?.email || "N/A"}</div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-700">{inv.hostelId?.name || "Global Platform Group"}</td>
                    <td className="py-3.5 text-slate-500 font-semibold">{inv.month}</td>
                    <td className="py-3.5 text-slate-900 font-black">${inv.amount?.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        inv.status === "paid" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {inv.status === "pending" ? (
                        <button
                          onClick={() => handleMarkAsPaid(inv._id)}
                          className="px-3 py-1.5 bg-[#00a896] text-white font-black text-[10px] uppercase tracking-wide rounded-lg hover:bg-teal-700 transition-colors cursor-pointer shadow-sm"
                        >
                          Clear Arrears
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                          <CheckCircle size={12} className="text-emerald-500" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🆕 UPDATED OVERLAY MODAL - Matching Warden Style */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200" style={heavySystemShadow}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Receipt size={16} className="text-[#00a896]" /> Generate Corporate Billing
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Create invoices for all active hostel wardens
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setInitResult(null);
                  setErrorMessage("");
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoices} className="space-y-4">
              {/* Month Input */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Billing Month
                </label>
                <input
                  type="month"
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Fee Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#00a896] focus:outline-none rounded-xl px-3 py-2 text-sm font-bold text-slate-800 transition-colors"
                  placeholder="Enter amount..."
                />
                <p className="text-[8px] text-slate-400 font-medium mt-1">
                  This amount will be charged to all active hostel wardens
                </p>
              </div>

              {/* Result Display */}
              {initResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  initResult.success 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {initResult.message}
                  {initResult.success && initResult.generated !== undefined && (
                    <div className="mt-1 text-[10px] font-medium space-y-0.5">
                      <div>✅ Generated: {initResult.generated} new invoices</div>
                      <div>📋 Already had bills: {initResult.alreadyHad || 0} wardens</div>
                      <div>🏢 Total hostels billed: {initResult.total || 0}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setInitResult(null);
                    setErrorMessage("");
                  }}
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
                  {submitting ? "Generating..." : "Generate Bills"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}