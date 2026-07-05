import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Layout and Page view component imports
import WardenLayout from "./layouts/WardenLayout";
import WardenOverview from "./pages/warden/WardenOverview";
import WardenRooms from "./pages/warden/WardenRooms";
import WardenStudents from "./pages/warden/StudentRoster";
import WardenComplaints from "./pages/warden/WardenComplaints";
import WardenProfile from "./pages/warden/WardenProfile";
import WardenNotices from "./pages/warden/WardenNotices";
import StudentLayout from "./layouts/StudentLayout";
import StudentOverview from "./pages/student/StudentOverview";
import NoticesComplaintsHub from "./pages/student/NoticesComplaintsHub";
import StudentFeeHub from "./pages/student/StudentFeeHub";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import StudentProfile from "./pages/student/StudentProfile";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminFeeHub from "./pages/admin/AdminFeeHub";
import WardenFees from "./pages/warden/WardenFees";
import AdminProfile from "./pages/admin/AdminProfile";
import WardenPaymentSuccess from "./pages/warden/WardenPaymentSuccess";
import WardenPaymentCancel from "./pages/warden/WardenPaymentCancel";
import AdminNotice from "./pages/admin/AdminNotice";
import { useEffect } from "react";

// ─── PROTECTED ROUTE COMPONENT ──────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      console.log("🔍 ProtectedRoute - User:", user?.role);
      if (!user) {
        console.log("❌ No user, redirecting to login");
        window.location.href = "/login";
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log("❌ Wrong role, redirecting to:", `/${user.role}`);
        window.location.href = `/${user.role}`;
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Payment Routes (Public) */}
          <Route path="/dashboard/fees/success" element={<PaymentSuccess />} />
          <Route path="/dashboard/fees/cancel" element={<PaymentCancel />} />

          {/* ─── WARDEN ROUTES (Protected) ─────────────────────────────────── */}
          <Route 
            path="/warden" 
            element={
              <ProtectedRoute allowedRoles={['warden']}>
                <WardenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WardenOverview />} />
            <Route path="rooms" element={<WardenRooms />} />
            <Route path="students" element={<WardenStudents />} />
            <Route path="complaint" element={<WardenComplaints />} />
            <Route path="profile" element={<WardenProfile />} />
            <Route path="notice" element={<WardenNotices />} />
            <Route path="fees" element={<WardenFees />} />
            <Route path="payment-success" element={<WardenPaymentSuccess />} />
            <Route path="payment-cancel" element={<WardenPaymentCancel />} />
          </Route>

          {/* ─── STUDENT ROUTES (Protected) ────────────────────────────────── */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentOverview />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="support-hub" element={<NoticesComplaintsHub />} />
            <Route path="fees" element={<StudentFeeHub />} />
          </Route>

          {/* ─── ADMIN ROUTES (Protected) ──────────────────────────────────── */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="billing" element={<AdminFeeHub />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notices" element={<AdminNotice />} />
          </Route>

          {/* Catch-All - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}