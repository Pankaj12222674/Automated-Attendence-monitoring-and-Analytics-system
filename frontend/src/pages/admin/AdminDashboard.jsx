import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import TimetableManager from "../../components/admin/TimetableManager";
import LibraryManager from "../../components/admin/LibraryManager";
import CourseCatalog from "../../components/admin/CourseCatalog";

const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Faculty: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Class: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  ),
  University: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.65 18h16.7a1 1 0 00.86-1.5l-7.5-13a1 1 0 00-1.72 0z" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Money: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Report: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Refresh: ({ spinning = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 1020 12" />
    </svg>
  ),
  Spark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Dots: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
};

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> },
  { key: "university", label: "University", icon: <Icons.University /> },
  { key: "users", label: "Students", icon: <Icons.Users /> },
  { key: "faculty", label: "Faculty", icon: <Icons.Faculty /> },
  { key: "academics", label: "Academics", icon: <Icons.Book /> },
    { key: "courses", label: "Master Courses", icon: <Icons.Book /> },
  { key: "attendance", label: "Attendance", icon: <Icons.TrendingUp /> },
  { key: "library", label: "Library", icon: <Icons.Book /> },
  { key: "results", label: "Results", icon: <Icons.Report /> },
  { key: "fees", label: "Fees", icon: <Icons.Money /> },
  { key: "reports", label: "Reports", icon: <Icons.Report /> },
  { key: "timetable", label: "Timetables", icon: <Icons.Calendar /> },
  { key: "announcements", label: "Announcements", icon: <Icons.Bell /> },
  { key: "audit", label: "Audit", icon: <Icons.ShieldCheck /> },
  { key: "settings", label: "Settings", icon: <Icons.Settings /> },
];

const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all duration-500 mb-6 ${className}`}>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-700/50 px-6 py-4">
      <div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="mt-3 md:mt-0">{action}</div>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="bg-slate-800/30 border border-dashed border-slate-600 rounded-xl p-8 text-center text-slate-400 text-sm">
    {text}
  </div>
);

const StatTile = ({ label, value, icon, color }) => (
  <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-5 flex items-center justify-between hover:border-cyan-500/30 transition-all duration-500">
    <div>
      <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm border border-${color.split('-')[1]}/20`}>
      <div className={color}>{icon}</div>
    </div>
  </div>
);

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

// Common Input Style
const inputClasses = "w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-2.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm placeholder-slate-500";
// Common Button Style
const btnClasses = "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalDepartments: 0,
    totalPrograms: 0,
    overallAttendance: 0,
    collectedFees: 0,
    pendingApprovals: 0,
  });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState("all");
  const [resultSectionFilter, setResultSectionFilter] = useState("all");

  const [className, setClassName] = useState("");
  const [classProgramId, setClassProgramId] = useState("");
  const [classSemester, setClassSemester] = useState(1);
  const [subjectName, setSubjectName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [assignClass, setAssignClass] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [timeSubject, setTimeSubject] = useState("");
  const [timeClass, setTimeClass] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [programName, setProgramName] = useState("");
  const [programDept, setProgramDept] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentProgram, setStudentProgram] = useState("");

  const [marksState, setMarksState] = useState({
    isOpen: false,
    student: null,
    subject: null,
    marksObtained: "",
    totalMarks: 100,
    remarks: ""
  });

  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherDepartment, setTeacherDepartment] = useState("");

  const [newAnnouncement, setNewAnnouncement] = useState("");

  const [settings, setSettings] = useState({
    universityName: "SmartAttendance University",
    currentSession: "2025-2026",
    attendanceThreshold: 75,
    currency: "INR",
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const safeRequest = useCallback(
    async (requestFn, fallbackMessage = "Something went wrong") => {
      try {
        setBusy(true);
        setError("");
        const res = await requestFn();
        return res;
      } catch (err) {
        const message = err?.response?.data?.message || fallbackMessage;
        setError(message);

        if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }

        throw err;
      } finally {
        setBusy(false);
      }
    },
    [navigate]
  );

  const loadAdminData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [
        statsRes,
        classRes,
        pendingRes,
        fullRes,
        uniRes,
        announcementsRes,
        auditRes,
        settingsRes,
      ] = await Promise.allSettled([
        api.get("/api/admin/stats"),
        api.get("/api/class/admin/all"),
        api.get("/api/admin/pending-users"),
        api.get("/api/admin/full-data"),
        api.get("/api/university/all"),
        api.get("/api/admin/announcements"),
        api.get("/api/admin/audit-logs"),
        api.get("/api/admin/settings"),
      ]);

      let nextTeachers = [];
      let nextStudents = [];
      let nextClasses = [];
      let nextDepartments = [];
      let nextPrograms = [];
      let nextFees = [];
      let nextPending = [];

      if (statsRes.status === "fulfilled") {
        setStats((prev) => ({ ...prev, ...statsRes.value.data }));
      }

      if (classRes.status === "fulfilled") {
        const data = classRes.value.data || {};
        nextClasses = data.classes || [];
        nextTeachers = data.teachers || [];
        setClasses(nextClasses);
        setSubjects(data.subjects || []);
        setTeachers(nextTeachers);
      }

      if (pendingRes.status === "fulfilled") {
        const users = pendingRes.value.data.users || [];
        nextPending = users;
        setPendingUsers(users);
        setStats((prev) => ({ ...prev, pendingApprovals: users.length }));
      }

      if (fullRes.status === "fulfilled") {
        const data = fullRes.value.data || {};
        nextStudents = data.students || [];
        nextFees = data.fees || [];
        setStudents(nextStudents);
        setLowAttendance(data.lowAttendance || []);
        setAttendanceTrend(data.trend || []);
        setFees(nextFees);
        setRecentActivities(data.activities || []);
      }

      if (uniRes.status === "fulfilled") {
        const data = uniRes.value.data || {};
        nextDepartments = data.departments || [];
        nextPrograms = data.programs || [];
        setDepartments(nextDepartments);
        setPrograms(nextPrograms);

        setStats((prev) => ({
          ...prev,
          totalDepartments: nextDepartments.length,
          totalPrograms: nextPrograms.length,
        }));
      }

      if (announcementsRes.status === "fulfilled") {
        setAnnouncements(announcementsRes.value.data.announcements || []);
      }

      if (auditRes.status === "fulfilled") {
        setAuditLogs(auditRes.value.data.logs || []);
      }

      if (settingsRes.status === "fulfilled") {
        setSettings((prev) => ({ ...prev, ...(settingsRes.value.data || {}) }));
      }

      setStats((prev) => ({
        ...prev,
        totalStudents: prev.totalStudents || nextStudents.length,
        totalTeachers: prev.totalTeachers || nextTeachers.length,
        totalClasses: prev.totalClasses || nextClasses.length,
        totalDepartments: prev.totalDepartments || nextDepartments.length,
        totalPrograms: prev.totalPrograms || nextPrograms.length,
        pendingApprovals:
          typeof prev.pendingApprovals === "number" ? prev.pendingApprovals : nextPending.length,
        collectedFees:
          prev.collectedFees ||
          nextFees
            .filter((f) => f.status === "paid")
            .reduce((sum, f) => sum + (f.amount || f.totalAmount || 0), 0),
      }));
    } catch {
      setError("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadAdminData();
  }, [token, loadAdminData]);

  const createDepartment = async () => {
    if (!departmentName.trim()) return alert("Enter department name");
    const res = await safeRequest(
      () => api.post("/api/university/create-department", { name: departmentName, head: departmentHead || null }),
      "Failed to create department"
    );
    if (res?.data?.dept) {
      setDepartments((prev) => [res.data.dept, ...prev]);
    } else {
      await loadAdminData();
    }
    setDepartmentName("");
    setDepartmentHead("");
    alert("Department created successfully");
  };

  const createProgram = async () => {
    if (!programName.trim() || !programDept) return alert("Enter program name and select a department");
    const res = await safeRequest(
      () => api.post("/api/university/create-program", { name: programName, departmentId: programDept }),
      "Failed to create program"
    );
    if (res?.data?.program) {
      setPrograms((prev) => [res.data.program, ...prev]);
    } else {
      await loadAdminData();
    }
    setProgramName("");
    setProgramDept("");
    alert("Program created successfully");
  };

  const addStudent = async () => {
    if (!studentName || !studentEmail || !studentClass || !studentProgram) return alert("Please fill all student fields");
    const res = await safeRequest(
      () => api.post("/api/university/enroll-student", { name: studentName, email: studentEmail, classId: studentClass, programId: studentProgram }),
      "Enrollment failed"
    );
    alert(`Student enrolled successfully. RegNo: ${res?.data?.student?.regNo || "Generated"}`);
    setStudentName("");
    setStudentEmail("");
    setStudentClass("");
    setStudentProgram("");
    loadAdminData();
  };

  const addTeacher = async () => {
    if (!teacherName || !teacherEmail || !teacherDepartment) return alert("Fill all teacher fields");
    const res = await safeRequest(
      () => api.post("/api/admin/teachers", { name: teacherName, email: teacherEmail, departmentId: teacherDepartment }),
      "Failed to create teacher"
    );
    if (res?.data?.teacher) {
      setTeachers((prev) => [res.data.teacher, ...prev]);
    } else {
      await loadAdminData();
    }
    setTeacherName("");
    setTeacherEmail("");
    setTeacherDepartment("");
    alert("Teacher added successfully");
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    await safeRequest(() => api.delete(`/api/admin/teachers/${id}`), "Failed to delete teacher");
    setTeachers((prev) => prev.filter((t) => t._id !== id));
  };

  const createClass = async () => {
    if (!className.trim() || !classProgramId || !classSemester) return alert("Enter class name, select a program, and enter a semester.");
    await safeRequest(() => api.post("/api/class/create-class", { 
      name: className, 
      programId: classProgramId, 
      semester: parseInt(classSemester) 
    }), "Failed to create class");
    setClassName("");
    setClassProgramId("");
    setClassSemester(1);
    loadAdminData();
  };

  const assignTeacherToClass = async () => {
    if (!assignClass || !assignTeacher) return alert("Select both class and teacher");
    await safeRequest(() => api.put("/api/class/assign-teacher", { classId: assignClass, teacherId: assignTeacher }), "Failed to assign teacher");
    setAssignClass("");
    setAssignTeacher("");
    alert("Teacher assigned successfully");
    loadAdminData();
  };

  const createSubject = async () => {
    if (!subjectName || !selectedClass || !selectedTeacher) return alert("Fill all subject fields");
    await safeRequest(() => api.post("/api/class/create-subject", { name: subjectName, classId: selectedClass, teacherId: selectedTeacher }), "Failed to create subject");
    setSubjectName("");
    setSelectedClass("");
    setSelectedTeacher("");
    loadAdminData();
  };

  const createTimetable = async () => {
    if (!day || !time || !timeSubject || !timeClass) return alert("Please fill all timetable fields");
    await safeRequest(() => api.post("/api/admin/create-timetable", { day, time, subjectId: timeSubject, classId: timeClass }), "Failed to create timetable");
    setDay("");
    setTime("");
    setTimeSubject("");
    setTimeClass("");
    alert("Timetable entry added successfully");
    loadAdminData();
  };

  const approveUser = async (id) => {
    await safeRequest(() => api.put(`/api/admin/approve/${id}`), "Failed to approve user");
    loadAdminData();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user request?")) return;
    await safeRequest(() => api.put(`/api/admin/reject/${id}`), "Failed to reject user");
    loadAdminData();
  };

  const sendAnnouncement = async () => {
    if (!newAnnouncement.trim()) return alert("Enter announcement message");
    await safeRequest(() => api.post("/api/admin/announcements", { message: newAnnouncement, target: announcementTarget }), "Failed to send announcement");
    setNewAnnouncement("");
    alert("Announcement sent successfully");
    loadAdminData();
  };

  const handleEnterMarks = (s, sub) => {
    setMarksState({
      isOpen: true,
      student: s,
      subject: sub,
      marksObtained: "",
      totalMarks: 100,
      remarks: ""
    });
  };

  const submitMarks = async () => {
    if (marksState.marksObtained === "") return alert("Enter marks obtained");
    await safeRequest(() => api.post("/api/admin/results", {
      studentId: marksState.student._id,
      subjectId: marksState.subject._id,
      marksObtained: Number(marksState.marksObtained),
      totalMarks: Number(marksState.totalMarks),
      remarks: marksState.remarks
    }), "Failed to save marks");
    alert("Marks saved successfully");
    setMarksState({ ...marksState, isOpen: false });
  };

  const saveSettings = async () => {
    await safeRequest(() => api.put("/api/admin/settings", settings), "Failed to save settings");
    alert("Settings saved");
  };

  const updateFeeStatus = async (feeId, status) => {
    await safeRequest(() => api.put(`/api/admin/fees/${feeId}`, { status }), "Failed to update fee status");
    setFees((prev) =>
      prev.map((f) =>
        f._id === feeId
          ? {
            ...f,
            status,
            amountPaid: status === "paid" ? f.totalAmount || f.amount || 0 : status === "pending" ? 0 : status === "partial" ? Math.max(1, Math.floor((f.totalAmount || f.amount || 0) / 2)) : f.amountPaid,
          }
          : f
      )
    );
  };

  const exportCSV = (filename, rows) => {
    if (!rows?.length) return alert("No data to export");
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase()) || s.roll?.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) || t.email?.toLowerCase().includes(teacherSearch.toLowerCase()));
  }, [teachers, teacherSearch]);

  const feeSummary = useMemo(() => {
    const total = fees.reduce((sum, f) => sum + (f.amount || f.totalAmount || 0), 0);
    const paid = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + (f.amount || f.totalAmount || 0), 0);
    return { total, paid, pending: total - paid };
  }, [fees]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
        <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin relative z-10"></div>
        <p className="mt-4 text-cyan-400 font-bold tracking-widest uppercase relative z-10">Initializing Core...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0f1c] font-sans text-slate-300 overflow-hidden selection:bg-cyan-500/30 relative">
      {/* Global Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/40 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col transition-all duration-300 z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {sidebarOpen ? <><Icons.ShieldCheck /> Admin Core</> : <Icons.ShieldCheck />}
          </h1>
        </div>
        <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {sidebarOpen && 'Terminal'}
        </div>
        <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
          <ul className="space-y-2 px-3">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.key ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <span className={`mr-3 ${activeTab === tab.key ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`}>
                    {tab.icon}
                  </span>
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-cyan-400 focus:outline-none transition-colors">
              <Icons.Menu />
            </button>
            <div className="hidden md:flex items-center bg-slate-800/50 rounded-xl px-4 py-2 w-72 border border-slate-700/50 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
              <span className="text-slate-400"><Icons.Search /></span>
              <input type="text" placeholder="Search system records..." className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-200 placeholder-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-700/50 pl-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-cyan-500/20">
                {settings.universityName.charAt(0)}
              </div>
              <div className="hidden md:block text-xs">
                <p className="font-bold text-white tracking-wide">Root Administrator</p>
                <p className="text-cyan-400">System Override</p>
              </div>
            </div>
            <button title="Log Out" onClick={() => { localStorage.clear(); navigate("/login"); }} className="ml-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/50 px-4 py-2 flex items-center gap-2 rounded-xl text-xs transition-all font-bold uppercase tracking-wider">
              Abort
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm relative backdrop-blur-sm">
              <strong className="font-black tracking-wider uppercase mr-2">System Error:</strong> {error}
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors duration-500">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Icons.Dashboard />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-wide">Command Center</h2>
                  <p className="text-sm text-slate-400 mt-1">Real-time telemetry and institutional overview.</p>
                </div>
                <div className="sm:ml-auto">
                  <button className={btnClasses + " flex items-center gap-2"} onClick={loadAdminData}>
                    <Icons.Refresh spinning={busy} /> Sync Data
                  </button>
                </div>
              </div>

              {/* Top Stats Banner */}
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-lg">Network Topology</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="md:px-4 py-2 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"><Icons.Users /></div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Students</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                          <span className="text-xs text-green-500 mb-1 flex items-center"><span className="text-[10px]">▲</span> Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:px-4 py-2 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center"><Icons.TrendingUp /></div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Attendance Rate</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-white">{stats.overallAttendance || 0}%</p>
                          <span className="text-xs text-green-500 mb-1 flex items-center"><span className="text-[10px]">▲</span> Stable</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:px-4 py-2 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center"><Icons.Money /></div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Fees Collected</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-green-500">₹{Math.max(stats.collectedFees || 0, feeSummary.paid).toLocaleString()}</p>
                          <span className="text-xs text-blue-500 mb-1 flex items-center"><span className="text-[10px]">▲</span> Total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Secondary Metrics">
                  <div className="grid grid-cols-2 gap-4">
                    <StatTile label="Total Faculty" value={stats.totalTeachers} icon={<Icons.Faculty />} color="text-blue-500" />
                    <StatTile label="Active Classes" value={stats.totalClasses} icon={<Icons.Class />} color="text-indigo-500" />
                    <StatTile label="Departments" value={stats.totalDepartments} icon={<Icons.University />} color="text-purple-500" />
                    <StatTile label="Programs" value={stats.totalPrograms} icon={<Icons.Book />} color="text-cyan-500" />
                  </div>
                </SectionCard>
                
                <SectionCard title="Pending Approvals & Alerts">
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Pending Users</p>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold text-white">{stats.pendingApprovals}</p>
                      <span className="text-sm text-red-500 font-medium">needs attention</span>
                    </div>
                  </div>
                  
                  {pendingUsers.length === 0 ? (
                    <EmptyState text="No pending requests." />
                  ) : (
                    <div className="space-y-2 mt-4">
                      {pendingUsers.slice(0, 3).map((user) => (
                        <div key={user._id} className="flex items-center justify-between py-2 border-b border-slate-700\/30 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => approveUser(user._id)} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">Approve</button>
                            <button onClick={() => rejectUser(user._id)} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex justify-center">
                    <button className="bg-gray-800 text-white text-xs px-4 py-2 rounded-full font-medium" onClick={() => setActiveTab("users")}>View All Pending</button>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {/* UNIVERSITY TAB */}
          {activeTab === "university" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <SectionCard title="Create Department" subtitle="Define a new academic department.">
                  <input className={inputClasses + " mb-3"} placeholder="Department Name" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} />
                  <select className={inputClasses + " mb-4"} value={departmentHead} onChange={(e) => setDepartmentHead(e.target.value)}>
                    <option value="">Head of Department (Optional)</option>
                    {teachers.map((t) => (<option key={t._id} value={t._id}>{t.name}</option>))}
                  </select>
                  <button onClick={createDepartment} className={btnClasses + " w-full"}>Create Department</button>
                </SectionCard>

                <SectionCard title="Create Program" subtitle="Add a new program under a department.">
                  <input className={inputClasses + " mb-3"} placeholder="Program Name" value={programName} onChange={(e) => setProgramName(e.target.value)} />
                  <select className={inputClasses + " mb-4"} value={programDept} onChange={(e) => setProgramDept(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
                  </select>
                  <button onClick={createProgram} className={btnClasses + " w-full bg-indigo-500 hover:bg-indigo-600"}>Create Program</button>
                </SectionCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <SectionCard title="Departments" subtitle="Current departmental structure." action={<button onClick={() => exportCSV("departments", departments)} className="text-xs bg-slate-800\/40 border border-gray-300 px-3 py-1 rounded">Export CSV</button>}>
                  {departments.length === 0 ? <EmptyState text="No departments created yet." /> : (
                    <div className="grid gap-3">
                      {departments.map((dept) => (
                        <div key={dept._id} className="border border-slate-700\/50 rounded p-4 bg-slate-800\/30 flex justify-between items-center">
                          <p className="font-semibold text-white">{dept.name}</p>
                          <span className="text-xs font-medium text-slate-400 bg-gray-200 px-2 py-1 rounded">
                            Programs: {programs.filter((p) => String(p.departmentId?._id || p.departmentId) === String(dept._id)).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Programs" subtitle="All registered programs." action={<button onClick={() => exportCSV("programs", programs)} className="text-xs bg-slate-800\/40 border border-gray-300 px-3 py-1 rounded">Export CSV</button>}>
                  {programs.length === 0 ? <EmptyState text="No programs created yet." /> : (
                    <div className="grid gap-3">
                      {programs.map((program) => (
                        <div key={program._id} className="border border-slate-700\/50 rounded p-4 bg-slate-800\/30">
                          <p className="font-semibold text-white">{program.name}</p>
                          <p className="text-xs text-slate-400 mt-1">Department: {departments.find((d) => String(d._id) === String(program.departmentId?._id || program.departmentId))?.name || "Unknown"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <SectionCard title="Enroll Student" subtitle="Create a student profile and attach it to a class and program.">
                <div className="grid md:grid-cols-5 gap-3">
                  <input className={inputClasses} placeholder="Full Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                  <input className={inputClasses} placeholder="University Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                  <select className={inputClasses} value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
                    <option value="">Select Class</option>
                    {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                  </select>
                  <select className={inputClasses} value={studentProgram} onChange={(e) => setStudentProgram(e.target.value)}>
                    <option value="">Select Program</option>
                    {programs.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
                  </select>
                  <button onClick={addStudent} className={btnClasses + " bg-green-500 hover:bg-green-600"}>Enroll</button>
                </div>
              </SectionCard>

              <SectionCard title="Student Directory" subtitle="Search and export student records." action={
                <div className="flex gap-2">
                  <input placeholder="Search student..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className={inputClasses + " w-auto"} />
                  <button onClick={() => exportCSV("students", filteredStudents)} className="bg-slate-800\/40 text-slate-200 border border-gray-300 text-sm px-3 py-2 rounded hover:bg-gray-200">Export</button>
                </div>
              }>
                {filteredStudents.length === 0 ? <EmptyState text="No students found." /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800\/30 border-y border-slate-700\/50 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Reg No</th>
                          <th className="py-3 px-4">Semester</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-800\/30">
                            <td className="py-3 px-4 font-medium text-white">{s.name}</td>
                            <td className="py-3 px-4 text-sm text-slate-300">{s.email}</td>
                            <td className="py-3 px-4 text-sm text-blue-600 font-mono">{s.roll || "N/A"}</td>
                            <td className="py-3 px-4 text-sm text-slate-300">{s.currentSemester || 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* FACULTY TAB */}
          {activeTab === "faculty" && (
            <div className="space-y-6">
              <SectionCard title="Add Teacher / Faculty" subtitle="Create a faculty profile and assign department.">
                <div className="grid md:grid-cols-4 gap-3">
                  <input className={inputClasses} placeholder="Full Name" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
                  <input className={inputClasses} placeholder="Email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} />
                  <select className={inputClasses} value={teacherDepartment} onChange={(e) => setTeacherDepartment(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
                  </select>
                  <button onClick={addTeacher} className={btnClasses + " bg-indigo-500 hover:bg-indigo-600"}>Add Faculty</button>
                </div>
              </SectionCard>

              <SectionCard title="Faculty Directory" subtitle="Search, review, and export faculty profiles." action={
                <div className="flex gap-2">
                  <input placeholder="Search faculty..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} className={inputClasses + " w-auto"} />
                  <button onClick={() => exportCSV("teachers", filteredTeachers)} className="bg-slate-800\/40 text-slate-200 border border-gray-300 text-sm px-3 py-2 rounded hover:bg-gray-200">Export</button>
                </div>
              }>
                {filteredTeachers.length === 0 ? <EmptyState text="No faculty found." /> : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeachers.map((t) => (
                      <div key={t._id} className="border border-slate-700\/50 rounded-md p-4 bg-transparent shadow-sm flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-white">{t.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{t.email}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => deleteTeacher(t._id)} className="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded transition-colors">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ACADEMICS TAB */}
          {activeTab === "courses" && (<div className="fade-in"><CourseCatalog /></div>)}

          {activeTab === "academics" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SectionCard title="Create Class / Cohort" subtitle="Provision a new class container.">
                <input className={inputClasses + " mb-3"} placeholder="Class / Cohort Name" value={className} onChange={(e) => setClassName(e.target.value)} />
                <select className={inputClasses + " mb-3"} value={classProgramId} onChange={(e) => setClassProgramId(e.target.value)}>
                  <option value="">Select Program</option>
                  {programs.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
                </select>
                <input type="number" min="1" max="10" className={inputClasses + " mb-4"} placeholder="Semester (e.g. 1)" value={classSemester} onChange={(e) => setClassSemester(e.target.value)} />
                <button onClick={createClass} className={btnClasses + " w-full bg-blue-900\/200 hover:bg-blue-600"}>Create Class</button>
              </SectionCard>

              <SectionCard title="Assign Teacher to Class" subtitle="Link a faculty member to a cohort.">
                <select className={inputClasses + " mb-3"} value={assignClass} onChange={(e) => setAssignClass(e.target.value)}>
                  <option value="">Select Class</option>
                  {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
                <select className={inputClasses + " mb-4"} value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)}>
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (<option key={t._id} value={t._id}>{t.name}</option>))}
                </select>
                <button onClick={assignTeacherToClass} className={btnClasses + " w-full bg-indigo-500 hover:bg-indigo-600"}>Assign Faculty</button>
              </SectionCard>

              {/* Subject creation is now automated via master course mapping in Create Class */}

              <SectionCard title="Create Timetable Entry" subtitle="Schedule a lecture or teaching slot." className="lg:col-span-3">
                <div className="grid md:grid-cols-5 gap-3">
                  <select className={inputClasses} value={day} onChange={(e) => setDay(e.target.value)}>
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                  <input type="time" className={inputClasses} value={time} onChange={(e) => setTime(e.target.value)} />
                  <select className={inputClasses} value={timeClass} onChange={(e) => setTimeClass(e.target.value)}>
                    <option value="">Select Class</option>
                    {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                  </select>
                  <select className={inputClasses} value={timeSubject} onChange={(e) => setTimeSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.filter((s) => String(s.classId?._id || s.classId) === String(timeClass)).map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
                  </select>
                  <button onClick={createTimetable} className={btnClasses + " bg-orange-500 hover:bg-orange-600"}>Save Entry</button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === "attendance" && (
            <div className="grid md:grid-cols-2 gap-6">
              <SectionCard title="Attendance Trend" subtitle="Monthly overview of attendance performance.">
                {attendanceTrend.length === 0 ? <EmptyState text="No attendance data available." /> : (
                  <div className="space-y-4">
                    {attendanceTrend.map((t, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-16 text-xs font-semibold text-slate-400 uppercase">{t.month}</span>
                        <div className="flex-1 h-2 bg-slate-800\/40 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${t.value}%` }} />
                        </div>
                        <span className="w-10 text-right text-sm font-bold text-slate-200">{t.value}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Students Below Threshold" subtitle="Priority list for intervention." action={<button onClick={() => exportCSV("low_attendance", lowAttendance)} className="text-xs bg-slate-800\/40 border border-gray-300 px-3 py-1 rounded">Export CSV</button>}>
                {lowAttendance.length === 0 ? <EmptyState text="No low attendance cases." /> : (
                  <div className="space-y-2">
                    {lowAttendance.map((s) => (
                      <div key={s._id} className="flex justify-between items-center py-2 border-b border-slate-700\/30 last:border-0">
                        <div>
                          <p className="font-semibold text-white text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">{s.attendance}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === "results" && (
              <SectionCard title="Results & Examination" subtitle="Mark entry launch points by student enrolled section.">
                {students.length === 0 ? <EmptyState text="No student records available." /> : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">    
                    {students.map((s) => (
                      <div key={s._id} className="border border-slate-700\/50 bg-transparent rounded-md p-4 shadow-sm flex flex-col h-full">
                        <p className="font-semibold text-white">{s.name}</p>    
                        <p className="text-xs text-slate-400 mb-1">{s.email}</p>
                        <p className="text-[10px] uppercase font-bold text-cyan-400 mb-4 bg-cyan-900/20 inline-block w-max px-2 py-0.5 rounded">
                          {s.classId ? `Section: ${s.classId.name} | Sem: ${s.classId.semester || 1}` : "No Section Assigned"}
                        </p>
                        
                        <div className="space-y-2 mt-auto">
                          {subjects
                            .filter((sub) => String(sub.classId?._id || sub.classId) === String(s.classId?._id || s.classId))
                            .map((sub) => (
                              <button key={sub._id} onClick={() => handleEnterMarks(s, sub)} className="w-full text-left text-xs bg-slate-800\/30 hover:bg-blue-900\/20 border border-slate-700\/50 hover:border-blue-300 text-slate-200 hover:text-blue-400 px-3 py-2 rounded transition-colors">        
                                Enter Marks: {sub.name}
                              </button>
                            ))
                          }
                          {subjects.filter((sub) => String(sub.classId?._id || sub.classId) === String(s.classId?._id || s.classId)).length === 0 && (
                             <p className="text-xs text-red-500 italic pt-2">No subjects mapped to this section.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

          {/* FEES TAB */}
          {activeTab === "fees" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-transparent border border-slate-700\/50 rounded p-5 shadow-sm text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Fees</p>
                  <p className="text-2xl font-bold text-white mt-1">₹{feeSummary.total.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-5 shadow-sm text-center">
                  <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Collected</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{feeSummary.paid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-5 shadow-sm text-center">
                  <p className="text-red-600 text-xs font-bold uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">₹{feeSummary.pending.toLocaleString()}</p>
                </div>
              </div>

              <SectionCard title="Financial Ledger" subtitle="Update fee record statuses and review balances.">
                {fees.length === 0 ? <EmptyState text="No fee records found." /> : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fees.map((f) => (
                      <div key={f._id} className="border border-slate-700\/50 rounded-md p-4 bg-transparent shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-white">{f.studentName || "Student"}</p>
                              <p className="text-xs text-slate-400">{f.studentEmail || ""}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${f.status === 'paid' ? 'bg-green-100 text-green-700' : f.status === 'partial' ? 'bg-orange-100 text-orange-700' : f.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-800\/40 text-slate-200'}`}>
                              {f.status}
                            </span>
                          </div>
                          
                          <div className="mt-4 mb-4 bg-slate-800\/30 rounded p-3 text-sm space-y-1 border border-slate-700\/30">
                            <div className="flex justify-between"><span className="text-slate-400">Amount:</span> <span className="font-semibold text-white">₹{(f.amount || f.totalAmount || 0).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Paid:</span> <span className="font-semibold text-green-600">₹{(f.amountPaid || 0).toLocaleString()}</span></div>
                            <div className="flex justify-between border-t border-slate-700\/50 pt-1 mt-1"><span className="text-slate-400">Balance:</span> <span className="font-semibold text-red-500">₹{Math.max((f.totalAmount || f.amount || 0) - (f.amountPaid || 0), 0).toLocaleString()}</span></div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button onClick={() => updateFeeStatus(f._id, "paid")} className="flex-1 text-[10px] uppercase font-bold bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 py-1.5 rounded transition-colors">Paid</button>
                          <button onClick={() => updateFeeStatus(f._id, "partial")} className="flex-1 text-[10px] uppercase font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 py-1.5 rounded transition-colors">Partial</button>
                          <button onClick={() => updateFeeStatus(f._id, "pending")} className="flex-1 text-[10px] uppercase font-bold bg-slate-800\/30 hover:bg-slate-800\/40 text-slate-300 border border-slate-700\/50 py-1.5 rounded transition-colors">Reset</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Student Report", desc: "Export student records", rows: students, name: "students_report" },
                { title: "Faculty Report", desc: "Export faculty records", rows: teachers, name: "faculty_report" },
                { title: "Department Report", desc: "Export departments", rows: departments, name: "department_report" },
                { title: "Program Report", desc: "Export programs", rows: programs, name: "program_report" },
                { title: "Attendance Report", desc: "Export low attendance", rows: lowAttendance, name: "attendance_report" },
                { title: "Fees Report", desc: "Export fees ledger", rows: fees, name: "fees_report" },
              ].map((r, i) => (
                <div key={i} className="bg-transparent border border-slate-700\/50 rounded p-5 shadow-sm text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-900\/20 text-blue-500 rounded-full flex items-center justify-center mb-3"><Icons.Report /></div>
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">{r.desc}</p>
                  <button onClick={() => exportCSV(r.name, r.rows)} className="w-full text-xs font-semibold uppercase text-blue-600 border border-blue-200 hover:bg-blue-900\/20 py-2 rounded transition-colors">Download CSV</button>
                </div>
              ))}
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <SectionCard title="Broadcast Announcement" subtitle="Send institution-wide notices.">
                <textarea rows={4} className={inputClasses + " mb-3 resize-none"} placeholder="Write announcement message..." value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} />
                <div className="flex gap-3">
                  <select className={inputClasses} value={announcementTarget} onChange={(e) => setAnnouncementTarget(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="students">Students</option>
                    <option value="teachers">Faculty</option>
                    <option value="admins">Admins</option>
                  </select>
                  <button onClick={sendAnnouncement} className={btnClasses + " whitespace-nowrap"}>Send Notice</button>
                </div>
              </SectionCard>

              <SectionCard title="Announcement Feed" subtitle="Recent communications.">
                {announcements.length === 0 ? <EmptyState text="No announcements available." /> : (
                  <div className="space-y-3">
                    {announcements.map((item, idx) => (
                      <div key={item._id || idx} className="border-l-4 border-blue-500 bg-slate-800\/30 p-3 rounded-r">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-500/20 px-2 py-0.5 rounded">{item.target || "all"}</span>
                          <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-200">{item.message || item.title || "Announcement"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === "audit" && (
            <SectionCard title="Audit Trail" subtitle="System logs and accountability events." action={<button onClick={() => exportCSV("audit_logs", auditLogs)} className="text-xs bg-slate-800\/40 border border-gray-300 px-3 py-1 rounded">Export CSV</button>}>
              {auditLogs.length === 0 ? <EmptyState text="No audit logs available." /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-800\/30 border-y border-slate-700\/50 text-slate-400">
                        <th className="py-2 px-4">Action</th>
                        <th className="py-2 px-4">User</th>
                        <th className="py-2 px-4">Module</th>
                        <th className="py-2 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.map((log, idx) => (
                        <tr key={log._id || idx} className="hover:bg-slate-800\/30">
                          <td className="py-2 px-4 text-white font-medium">{log.action || log.message || "Audit event"}</td>
                          <td className="py-2 px-4 text-slate-300">{log.actorName || log.user?.name || log.email || "System"}</td>
                          <td className="py-2 px-4"><span className="bg-gray-200 text-slate-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{log.module || log.type || "general"}</span></td>
                          <td className="py-2 px-4 text-slate-400 text-xs">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <SectionCard title="Platform Settings" subtitle="Update institutional display and policy values.">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">University Name</label>
                    <input className={inputClasses} value={settings.universityName} onChange={(e) => setSettings((prev) => ({ ...prev, universityName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Session</label>
                    <input className={inputClasses} value={settings.currentSession} onChange={(e) => setSettings((prev) => ({ ...prev, currentSession: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Attendance Threshold (%)</label>
                    <input type="number" className={inputClasses} value={settings.attendanceThreshold} onChange={(e) => setSettings((prev) => ({ ...prev, attendanceThreshold: Number(e.target.value || 0) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                    <select className={inputClasses} value={settings.currency} onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value }))}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <button onClick={saveSettings} className={btnClasses + " w-full mt-2 bg-green-500 hover:bg-green-600"}>Save Settings</button>
                </div>
              </SectionCard>

              <SectionCard title="System Overview" subtitle="Configuration summary.">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800\/30 border border-slate-700\/50 rounded p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Current Session</p>
                    <p className="text-lg font-semibold text-white mt-1">{settings.currentSession}</p>
                  </div>
                  <div className="bg-slate-800\/30 border border-slate-700\/50 rounded p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Attendance Threshold</p>
                    <p className="text-lg font-semibold text-blue-600 mt-1">{settings.attendanceThreshold}%</p>
                  </div>
                  <div className="bg-slate-800\/30 border border-slate-700\/50 rounded p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Currency</p>
                    <p className="text-lg font-semibold text-white mt-1">{settings.currency}</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-900\/20 text-blue-400 p-3 rounded text-sm border border-blue-500\/30">
                  Changing these values will immediately affect how data is presented globally across the dashboard.
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "timetable" && (
            <TimetableManager classes={classes} subjects={subjects} teachers={teachers} />
          )}

          {activeTab === "library" && (
            <div className="animate-fadeIn">
              <LibraryManager />
            </div>
          )}
        </main>
      </div>

      {/* Marks Entry Modal */}
      {marksState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">Enter Marks</h2>
            <p className="text-sm text-slate-300 mb-4">
              Student: <span className="font-semibold">{marksState.student?.name}</span> <br/>
              Subject: <span className="font-semibold">{marksState.subject?.name}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Marks Obtained</label>
                <input type="number" className={inputClasses} value={marksState.marksObtained} onChange={(e) => setMarksState({ ...marksState, marksObtained: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Marks</label>
                <input type="number" className={inputClasses} value={marksState.totalMarks} onChange={(e) => setMarksState({ ...marksState, totalMarks: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
                <textarea rows={2} className={inputClasses + " resize-none"} value={marksState.remarks} onChange={(e) => setMarksState({ ...marksState, remarks: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-gray-200 text-slate-200 py-2 rounded font-medium text-sm hover:bg-gray-300" onClick={() => setMarksState({ ...marksState, isOpen: false })}>Cancel</button>
              <button className="flex-1 bg-blue-900\/200 text-white py-2 rounded font-medium text-sm hover:bg-blue-600" onClick={submitMarks}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}