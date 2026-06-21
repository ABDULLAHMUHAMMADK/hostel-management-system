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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Root Platform Entrance Gateway */}
          <Route path="/" element={<Landing />} />{" "}
          {/* 2. RE-MOUNTED THE BASE ROUTE */}
          {/* Public Authentication Route Gateway */}
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
          </Route>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentOverview />} />
          <Route path="/student/support-hub" element={<NoticesComplaintsHub/>} />
          </Route>
          {/* Catch-All Automatic Fallback Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
