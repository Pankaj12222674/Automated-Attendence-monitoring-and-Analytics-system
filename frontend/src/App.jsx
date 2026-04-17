import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

/* AUTH */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* STUDENT */
import StudentDashboard from "./pages/student/StudentDashboard";
import SubjectDetails from "./pages/student/SubjectDetails";
import StudentQRScanner from "./pages/student/StudentQRScanner";
import Assignments from "./pages/student/Assignments";
import BursarPortal from "./pages/student/Bursar";

/* TEACHER (FACULTY) */
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import GenerateQR from "./pages/teacher/GenerateQR";
import ManualAttendance from "./pages/teacher/ManualAttendance";
import TeacherQRScanner from "./pages/teacher/QRScanner";
import FaceAttendance from "./pages/teacher/FaceAttendance";
import ClassStudents from "./pages/teacher/ClassStudents";
import TeacherAssignments from "./pages/teacher/Assignments";
import AttendanceHistory from "./pages/teacher/AttendanceHistory";

/* ADMIN (UNIVERSITY RECORDS) */
import AdminDashboard from "./pages/admin/AdminDashboard";

/* PROTECTED ROUTE WRAPPER */
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= AUTHENTICATION ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= STUDENT PORTAL ================= */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/details"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher"]}>
              <SubjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/qr-scan"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentQRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/bursar"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher"]}>
              <BursarPortal />
            </ProtectedRoute>
          }
        />

        {/* ================= FACULTY PORTAL ================= */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/manual-attendance"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ManualAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/generate-qr"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <GenerateQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/qr-scanner"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherQRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/face-attendance"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <FaceAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/class-students"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ClassStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance-history"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        {/* ================= UNIVERSITY ADMIN ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 NOT FOUND ================= */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-black text-slate-800 mb-2">
                404 - Page Not Found
              </h1>

              <p className="text-slate-500 mb-8 max-w-md">
                The university resource or portal page you are looking for does not exist, has
                been moved, or you lack the required clearance.
              </p>

              <Link
                to="/login"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-200"
              >
                Return to Portal Gateway
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;