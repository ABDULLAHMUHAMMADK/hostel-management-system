import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing"; // 1. RE-IMPORTED THE LANDING PAGE VIEW
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Root Platform Entrance Gateway */}
          <Route path="/" element={<Landing />} />{" "}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Secure Warden Dashboard Route Structure Wrapper */}
          <Route path="/warden" element={<WardenLayout />}>
            <Route index element={<WardenOverview />} />
            <Route path="rooms" element={<WardenRooms />} />
            <Route path="students" element={<WardenStudents />} />
            <Route path="complaint" element={<WardenComplaints />} />
            <Route path="profile" element={<WardenProfile />} />
            <Route path="notice" element={<WardenNotices />} />
            <Route path="fees" element={<WardenFees/>} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentOverview />} />
            <Route path="profile"  element={<StudentProfile/>} />
            <Route
              path="/student/support-hub"
              element={<NoticesComplaintsHub />}
            />
            <Route
              path="/student/fees"
              element={<StudentFeeHub/>}
            />
          
          </Route>

          <Route path="/admin" element={<AdminLayout/>}>

          <Route index element={<AdminOverview/>} />
          <Route path="billing" element={<AdminFeeHub/>} />
          <Route path="profile" element={<AdminProfile/>} />
            
          </Route>



          {/* Catch-All Automatic Fallback Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard/fees/success" element={<PaymentSuccess/>} />
          <Route path="/dashboard/fees/cancel" element={<PaymentCancel/>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
