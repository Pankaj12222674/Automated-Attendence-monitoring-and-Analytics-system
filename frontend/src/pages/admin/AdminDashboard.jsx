import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIClient from "../../api";

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
};

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> },
  { key: "university", label: "University", icon: <Icons.University /> },
  { key: "users", label: "Students", icon: <Icons.Users /> },
  { key: "faculty", label: "Faculty", icon: <Icons.Faculty /> },
  { key: "academics", label: "Academics", icon: <Icons.Book /> },
  { key: "attendance", label: "Attendance", icon: <Icons.TrendingUp /> },
  { key: "results", label: "Results", icon: <Icons.Report /> },
  { key: "fees", label: "Fees", icon: <Icons.Money /> },
  { key: "reports", label: "Reports", icon: <Icons.Report /> },
  { key: "announcements", label: "Announcements", icon: <Icons.Bell /> },
  { key: "audit", label: "Audit", icon: <Icons.ShieldCheck /> },
  { key: "settings", label: "Settings", icon: <Icons.Settings /> },
];

const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <div
    className={`bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-xl hover:border-cyan-500/20 transition-colors duration-500 ${className}`}
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 md:px-8 pt-6 md:pt-8 mb-5">
      <div>
        <h3 className="text-white text-lg font-bold tracking-tight">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-400 mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    <div className="px-6 md:px-8 pb-6 md:pb-8">{children}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 shadow-inner">
    {text}
  </div>
);

const StatTile = ({ label, value, icon, accent, color }) => (
  <div
    className={`bg-gradient-to-br ${accent} bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-6 shadow-xl hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">
          {label}
        </p>
        <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-950/60 border border-white/10 shadow-inner ${color}`}
      >
        {icon}
      </div>
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

  const [className, setClassName] = useState("");
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
        APIClient.get("/api/admin/stats"),
        APIClient.get("/api/class/admin/all"),
        APIClient.get("/api/admin/pending-users"),
        APIClient.get("/api/admin/full-data"),
        APIClient.get("/api/university/all"),
        APIClient.get("/api/admin/announcements"),
        APIClient.get("/api/admin/audit-logs"),
        APIClient.get("/api/admin/settings"),
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

      // fallback stat normalization
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
      () =>
        APIClient.post("/api/university/create-department", {
          name: departmentName,
          head: departmentHead || null,
        }),
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
    if (!programName.trim() || !programDept) {
      return alert("Enter program name and select a department");
    }

    const res = await safeRequest(
      () =>
        APIClient.post("/api/university/create-program", {
          name: programName,
          departmentId: programDept,
        }),
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
    if (!studentName || !studentEmail || !studentClass || !studentProgram) {
      return alert("Please fill all student fields");
    }

    const res = await safeRequest(
      () =>
        APIClient.post("/api/university/enroll-student", {
          name: studentName,
          email: studentEmail,
          classId: studentClass,
          programId: studentProgram,
        }),
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
    if (!teacherName || !teacherEmail || !teacherDepartment) {
      return alert("Fill all teacher fields");
    }

    const res = await safeRequest(
      () =>
        APIClient.post("/api/admin/teachers", {
          name: teacherName,
          email: teacherEmail,
          departmentId: teacherDepartment,
        }),
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

    await safeRequest(() => APIClient.delete(`/api/admin/teachers/${id}`), "Failed to delete teacher");

    setTeachers((prev) => prev.filter((t) => t._id !== id));
  };

  const createClass = async () => {
    if (!className.trim()) return alert("Enter class name");

    await safeRequest(() => APIClient.post("/api/class/create-class", { name: className }), "Failed to create class");

    setClassName("");
    loadAdminData();
  };

  const assignTeacherToClass = async () => {
    if (!assignClass || !assignTeacher) return alert("Select both class and teacher");

    await safeRequest(
      () =>
        APIClient.put("/api/class/assign-teacher", {
          classId: assignClass,
          teacherId: assignTeacher,
        }),
      "Failed to assign teacher"
    );

    setAssignClass("");
    setAssignTeacher("");
    alert("Teacher assigned successfully");
    loadAdminData();
  };

  const createSubject = async () => {
    if (!subjectName || !selectedClass || !selectedTeacher) {
      return alert("Fill all subject fields");
    }

    await safeRequest(
      () =>
        APIClient.post("/api/class/create-subject", {
          name: subjectName,
          classId: selectedClass,
          teacherId: selectedTeacher,
        }),
      "Failed to create subject"
    );

    setSubjectName("");
    setSelectedClass("");
    setSelectedTeacher("");
    loadAdminData();
  };

  const createTimetable = async () => {
    if (!day || !time || !timeSubject || !timeClass) {
      return alert("Please fill all timetable fields");
    }

    await safeRequest(
      () =>
        APIClient.post("/api/admin/create-timetable", {
          day,
          time,
          subjectId: timeSubject,
          classId: timeClass,
        }),
      "Failed to create timetable"
    );

    setDay("");
    setTime("");
    setTimeSubject("");
    setTimeClass("");
    alert("Timetable entry added successfully");
    loadAdminData();
  };

  const approveUser = async (id) => {
    await safeRequest(() => APIClient.put(`/api/admin/approve/${id}`), "Failed to approve user");
    loadAdminData();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user request?")) return;

    await safeRequest(() => APIClient.put(`/api/admin/reject/${id}`), "Failed to reject user");
    loadAdminData();
  };

  const sendAnnouncement = async () => {
    if (!newAnnouncement.trim()) return alert("Enter announcement message");

    await safeRequest(
      () =>
        APIClient.post("/api/admin/announcements", {
          message: newAnnouncement,
          target: announcementTarget,
        }),
      "Failed to send announcement"
    );

    setNewAnnouncement("");
    alert("Announcement sent successfully");
    loadAdminData();
  };

  const saveSettings = async () => {
    await safeRequest(() => APIClient.put("/api/admin/settings", settings), "Failed to save settings");
    alert("Settings saved");
  };

  const updateFeeStatus = async (feeId, status) => {
    await safeRequest(
      () =>
        APIClient.put(`/api/admin/fees/${feeId}`, {
          status,
        }),
      "Failed to update fee status"
    );

    setFees((prev) =>
      prev.map((f) =>
        f._id === feeId
          ? {
              ...f,
              status,
              amountPaid:
                status === "paid"
                  ? f.totalAmount || f.amount || 0
                  : status === "pending"
                  ? 0
                  : status === "partial"
                  ? Math.max(1, Math.floor((f.totalAmount || f.amount || 0) / 2))
                  : f.amountPaid,
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
      ...rows.map((row) =>
        headers.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
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
      (s) =>
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.roll?.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email?.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  }, [teachers, teacherSearch]);

  const feeSummary = useMemo(() => {
    const total = fees.reduce((sum, f) => sum + (f.amount || f.totalAmount || 0), 0);
    const paid = fees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + (f.amount || f.totalAmount || 0), 0);

    return {
      total,
      paid,
      pending: total - paid,
    };
  }, [fees]);

  const quickActions = [
    {
      title: "Enroll Student",
      subtitle: "Create student profile + fees",
      tab: "users",
      color: "from-emerald-500/20 to-teal-600/5 hover:border-emerald-500/30",
    },
    {
      title: "Add Faculty",
      subtitle: "Provision a teacher account",
      tab: "faculty",
      color: "from-blue-500/20 to-indigo-600/5 hover:border-blue-500/30",
    },
    {
      title: "Create Program",
      subtitle: "Expand university structure",
      tab: "university",
      color: "from-cyan-500/20 to-blue-600/5 hover:border-cyan-500/30",
    },
    {
      title: "Schedule Lecture",
      subtitle: "Add timetable block",
      tab: "academics",
      color: "from-amber-500/20 to-orange-600/5 hover:border-amber-500/30",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <p className="mt-5 text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold animate-pulse">
            Booting Command Center
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden relative selection:bg-cyan-500/20 font-sans">
      {/* Background FX matching the SmartAttendance glassmorphism theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-float-delayed" />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-float-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmurlCtncmlkKSIvPjwvc3ZnPg==')] opacity-50 z-0" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-2xl">
        <div className="max-w-[98rem] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
             <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.35)] shrink-0">
               <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl font-black">
                  SA
               </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black text-xl tracking-tight truncate">
                {settings.universityName || "SmartAttendance"} • Admin OS
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-400">
                  Session {settings.currentSession}
                </span>
                <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  System Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={loadAdminData}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-bold transition disabled:opacity-60 shadow-inner"
            >
              <span className="inline-flex items-center gap-2">
                <Icons.Refresh spinning={busy} /> <span className="hidden sm:inline">Refresh</span>
              </span>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-4 md:px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-slate-600 text-slate-200 text-sm font-bold transition shadow-inner"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[98rem] mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {/* Top banner */}
        <div className="mb-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-black uppercase tracking-[0.25em] text-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Icons.Spark /> Command Center
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Advanced Administration Dashboard
              </h2>
              <p className="text-slate-400 max-w-3xl mt-3 text-sm md:text-base leading-relaxed font-medium">
                Manage academic operations, enrollments, faculty, attendance trends, financial
                records, and global announcements from one premium control surface.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full lg:min-w-[32rem]">
              {quickActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(item.tab)}
                  className={`text-left rounded-2xl p-4 border border-slate-700/50 bg-gradient-to-br bg-slate-900/40 hover:bg-slate-900/60 ${item.color} transition-all duration-300 shadow-lg`}
                >
                  <p className="text-white font-bold text-sm">{item.title}</p>
                  <p className="text-slate-400 text-xs mt-1 font-medium">{item.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 px-5 py-4 font-medium shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto hide-scrollbar">
          <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 md:px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-transparent"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                {
                  label: "Total Students",
                  value: stats.totalStudents,
                  icon: <Icons.Users />,
                  accent: "from-cyan-500/10 to-blue-600/5",
                  color: "text-cyan-400",
                },
                {
                  label: "Total Faculty",
                  value: stats.totalTeachers,
                  icon: <Icons.Faculty />,
                  accent: "from-blue-500/10 to-indigo-600/5",
                  color: "text-blue-400",
                },
                {
                  label: "Active Classes",
                  value: stats.totalClasses,
                  icon: <Icons.Class />,
                  accent: "from-emerald-500/10 to-teal-600/5",
                  color: "text-emerald-400",
                },
                {
                  label: "Attendance",
                  value: `${stats.overallAttendance || 0}%`,
                  icon: <Icons.TrendingUp />,
                  accent: "from-amber-500/10 to-orange-600/5",
                  color: "text-amber-400",
                },
                {
                  label: "Departments",
                  value: stats.totalDepartments,
                  icon: <Icons.University />,
                  accent: "from-indigo-500/10 to-purple-600/5",
                  color: "text-indigo-400",
                },
                {
                  label: "Programs",
                  value: stats.totalPrograms,
                  icon: <Icons.Book />,
                  accent: "from-purple-500/10 to-pink-600/5",
                  color: "text-purple-400",
                },
                {
                  label: "Pending Approvals",
                  value: stats.pendingApprovals,
                  icon: <Icons.Alert />,
                  accent: "from-rose-500/10 to-red-600/5",
                  color: "text-rose-400",
                },
                {
                  label: "Fees Collected",
                  value: `₹${Math.max(stats.collectedFees || 0, feeSummary.paid).toLocaleString()}`,
                  icon: <Icons.Money />,
                  accent: "from-emerald-500/10 to-green-600/5",
                  color: "text-emerald-400",
                },
              ].map((card, i) => (
                <StatTile key={i} {...card} />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <SectionCard
                title="Pending Access Approvals"
                subtitle="Review and authorize new account requests."
                action={
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black shadow-inner">
                    {pendingUsers.length} Pending
                  </span>
                }
              >
                {pendingUsers.length === 0 ? (
                  <EmptyState text="No pending requests." />
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 5).map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => approveUser(user._id)}
                            className="px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-xs font-black transition-colors"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => rejectUser(user._id)}
                            className="px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-black transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Critical Attendance Alerts" subtitle="Students below threshold requiring intervention.">
                {lowAttendance.length === 0 ? (
                  <EmptyState text="All students are above threshold." />
                ) : (
                  <div className="space-y-3">
                    {lowAttendance.slice(0, 6).map((s) => (
                      <div
                        key={s._id}
                        className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 flex justify-between items-center shadow-inner"
                      >
                        <div>
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>

                        <span className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black shadow-inner">
                          {s.attendance}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Recent Activity" subtitle="Latest operational events across the system.">
                {recentActivities.length === 0 ? (
                  <EmptyState text="No recent activity available." />
                ) : (
                  <div className="space-y-3">
                    {recentActivities.slice(0, 6).map((log, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner"
                      >
                        <p className="text-white text-sm font-medium">{log.message || "Activity logged"}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(log.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        )}

        {/* UNIVERSITY */}
        {activeTab === "university" && (
          <div className="space-y-8 animate-fadeUp">
            <div className="grid lg:grid-cols-2 gap-6">
              <SectionCard title="Create Department" subtitle="Define a new academic department.">
                <input
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  placeholder="Department Name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                />

                <select
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-6 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                  value={departmentHead}
                  onChange={(e) => setDepartmentHead(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Head of Department (Optional)</option>
                  {teachers.map((t) => (
                    <option className="bg-slate-900" key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createDepartment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
                >
                  Create Department
                </button>
              </SectionCard>

              <SectionCard title="Create Program" subtitle="Add a new program under a department.">
                <input
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  placeholder="Program Name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                />

                <select
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-6 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                  value={programDept}
                  onChange={(e) => setProgramDept(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Department</option>
                  {departments.map((d) => (
                    <option className="bg-slate-900" key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createProgram}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300"
                >
                  Create Program
                </button>
              </SectionCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <SectionCard
                title="Departments"
                subtitle="Current departmental structure."
                action={
                  <button
                    onClick={() => exportCSV("departments", departments)}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-sm font-bold text-slate-200 transition-colors shadow-inner"
                  >
                    Export CSV
                  </button>
                }
              >
                {departments.length === 0 ? (
                  <EmptyState text="No departments created yet." />
                ) : (
                  <div className="grid gap-3">
                    {departments.map((dept) => (
                      <div
                        key={dept._id}
                        className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner"
                      >
                        <p className="text-white font-bold">{dept.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Programs:{" "}
                          {
                            programs.filter(
                              (p) =>
                                String(p.departmentId?._id || p.departmentId) === String(dept._id)
                            ).length
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Programs"
                subtitle="All registered programs."
                action={
                  <button
                    onClick={() => exportCSV("programs", programs)}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-sm font-bold text-slate-200 transition-colors shadow-inner"
                  >
                    Export CSV
                  </button>
                }
              >
                {programs.length === 0 ? (
                  <EmptyState text="No programs created yet." />
                ) : (
                  <div className="grid gap-3">
                    {programs.map((program) => (
                      <div
                        key={program._id}
                        className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner"
                      >
                        <p className="text-white font-bold">{program.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Department:{" "}
                          {departments.find(
                            (d) =>
                              String(d._id) === String(program.departmentId?._id || program.departmentId)
                          )?.name || "Unknown"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="space-y-8 animate-fadeUp">
            <SectionCard title="Enroll Student" subtitle="Create a student profile and attach it to a class and program.">
              <div className="grid md:grid-cols-5 gap-4">
                <input
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  placeholder="Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />

                <input
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  placeholder="University Email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />

                <select
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Class</option>
                  {classes.map((c) => (
                    <option className="bg-slate-900" key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                  value={studentProgram}
                  onChange={(e) => setStudentProgram(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Program</option>
                  {programs.map((p) => (
                    <option className="bg-slate-900" key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addStudent}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                >
                  Enroll
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Student Directory"
              subtitle="Search and export student records."
              action={
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Icons.Search />
                     </span>
                     <input
                        placeholder="Search student..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="bg-slate-950/70 border border-slate-700/50 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm w-full md:w-auto"
                     />
                  </div>
                  <button
                    onClick={() => exportCSV("students", filteredStudents)}
                    className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200 transition-colors shadow-inner"
                  >
                    Export CSV
                  </button>
                </div>
              }
            >
              {filteredStudents.length === 0 ? (
                <EmptyState text="No students found." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredStudents.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-[2rem] border border-slate-700/50 bg-slate-900/40 p-5 shadow-lg hover:border-cyan-500/30 transition-colors duration-300"
                    >
                      <p className="font-bold text-white text-lg truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono truncate">{s.email}</p>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800 shadow-inner">
                          <p className="text-slate-500 font-medium">Reg No</p>
                          <p className="text-cyan-400 font-bold mt-1 truncate">{s.roll || "N/A"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800 shadow-inner">
                          <p className="text-slate-500 font-medium">Semester</p>
                          <p className="text-white font-bold mt-1">{s.currentSemester || 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* FACULTY */}
        {activeTab === "faculty" && (
          <div className="space-y-8 animate-fadeUp">
            <SectionCard title="Add Teacher / Faculty" subtitle="Create a faculty profile and assign department.">
              <div className="grid md:grid-cols-4 gap-4">
                <input
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Full Name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />

                <input
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                />

                <select
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none"
                  value={teacherDepartment}
                  onChange={(e) => setTeacherDepartment(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Department</option>
                  {departments.map((d) => (
                    <option className="bg-slate-900" key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addTeacher}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300"
                >
                  Add Faculty
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Faculty Directory"
              subtitle="Search, review, and export faculty profiles."
              action={
                <div className="flex flex-col md:flex-row gap-3">
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Icons.Search />
                     </span>
                     <input
                        placeholder="Search faculty..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="bg-slate-950/70 border border-slate-700/50 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm w-full md:w-auto"
                     />
                  </div>
                  <button
                    onClick={() => exportCSV("teachers", filteredTeachers)}
                    className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200 transition-colors shadow-inner"
                  >
                    Export CSV
                  </button>
                </div>
              }
            >
              {filteredTeachers.length === 0 ? (
                <EmptyState text="No faculty found." />
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredTeachers.map((t) => (
                    <div
                      key={t._id}
                      className="rounded-[2rem] border border-slate-700/50 bg-slate-900/40 p-5 shadow-lg hover:border-blue-500/30 transition-colors duration-300 flex flex-col justify-between"
                    >
                      <div>
                         <p className="text-white font-bold text-lg truncate">{t.name}</p>
                         <p className="text-xs text-slate-400 mt-1 font-mono truncate">{t.email}</p>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => deleteTeacher(t._id)}
                          className="px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-bold transition-colors shadow-inner"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ACADEMICS */}
        {activeTab === "academics" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeUp">
            <SectionCard title="Create Class / Cohort" subtitle="Provision a new class container.">
              <input
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-5 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                placeholder="Class / Cohort Name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />

              <button
                onClick={createClass}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
              >
                Create Class
              </button>
            </SectionCard>

            <SectionCard title="Assign Teacher to Class" subtitle="Link a faculty member to a cohort.">
              <select
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                value={assignClass}
                onChange={(e) => setAssignClass(e.target.value)}
              >
                <option className="bg-slate-900" value="">Select Class</option>
                {classes.map((c) => (
                  <option className="bg-slate-900" key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                value={assignTeacher}
                onChange={(e) => setAssignTeacher(e.target.value)}
              >
                <option className="bg-slate-900" value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option className="bg-slate-900" key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={assignTeacherToClass}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
              >
                Assign Faculty
              </button>
            </SectionCard>

            <SectionCard title="Create Subject" subtitle="Attach a subject to class and faculty.">
              <input
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                placeholder="Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />

              <select
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium appearance-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option className="bg-slate-900" value="">Select Class</option>
                {classes.map((c) => (
                  <option className="bg-slate-900" key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white mb-5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium appearance-none"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option className="bg-slate-900" value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option className="bg-slate-900" key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={createSubject}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
              >
                Create Subject
              </button>
            </SectionCard>

            <SectionCard
              title="Create Timetable Entry"
              subtitle="Schedule a lecture or teaching slot."
              className="xl:col-span-3"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <select
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium appearance-none"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Day</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                    <option className="bg-slate-900" key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  className="rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

                <select
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium appearance-none"
                  value={timeClass}
                  onChange={(e) => setTimeClass(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Class</option>
                  {classes.map((c) => (
                    <option className="bg-slate-900" key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium appearance-none"
                  value={timeSubject}
                  onChange={(e) => setTimeSubject(e.target.value)}
                >
                  <option className="bg-slate-900" value="">Select Subject</option>
                  {subjects
                    .filter((s) => String(s.classId?._id || s.classId) === String(timeClass))
                    .map((s) => (
                      <option className="bg-slate-900" key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <button
                  onClick={createTimetable}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black tracking-widest uppercase text-sm py-3.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300"
                >
                  Save Entry
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fadeUp">
            <SectionCard title="Attendance Trend" subtitle="Monthly overview of attendance performance.">
              {attendanceTrend.length === 0 ? (
                <EmptyState text="No attendance data available." />
              ) : (
                <div className="space-y-5">
                  {attendanceTrend.map((t, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-24 text-xs font-bold uppercase tracking-widest text-slate-400">
                        {t.month}
                      </span>

                      <div className="flex-1 rounded-full h-3 bg-slate-950/70 border border-slate-800 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-1000"
                          style={{ width: `${t.value}%` }}
                        />
                      </div>

                      <span className="w-12 text-right text-cyan-400 font-black">
                        {t.value}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Students Below Threshold"
              subtitle="Priority list for intervention and notifications."
              action={
                <button
                  onClick={() => exportCSV("low_attendance", lowAttendance)}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-sm font-bold text-slate-200 transition-colors shadow-inner"
                >
                  Export CSV
                </button>
              }
            >
              {lowAttendance.length === 0 ? (
                <EmptyState text="No low attendance cases." />
              ) : (
                <div className="space-y-3">
                  {lowAttendance.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 flex justify-between items-center shadow-inner"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">{s.email}</p>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black shadow-inner shrink-0">
                        {s.attendance}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <SectionCard
            title="Results & Examination"
            subtitle="Mark entry launch points by student and subject."
            className="animate-fadeUp"
          >
            {students.length === 0 ? (
              <EmptyState text="No student records available." />
            ) : (
              <div className="space-y-5">
                {students.map((s) => (
                  <div
                    key={s._id}
                    className="rounded-[2rem] border border-slate-700/50 bg-slate-900/40 p-6 hover:border-cyan-500/30 transition-colors duration-300"
                  >
                    <p className="text-white font-black text-xl flex items-center flex-wrap gap-3">
                      {s.name}
                      <span className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-950/70 text-xs text-slate-400 font-mono shadow-inner">
                        {s.email}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5">
                      {subjects.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => alert(`Open marks entry for ${s.name} - ${sub.name}`)}
                          className="px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-cyan-600/20 border border-slate-600 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-all shadow-inner"
                        >
                          Enter Marks: {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* FEES */}
        {activeTab === "fees" && (
          <div className="space-y-6 animate-fadeUp">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-6 shadow-xl">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Fees</p>
                <p className="text-3xl font-black text-white mt-2">
                  ₹{feeSummary.total.toLocaleString()}
                </p>
              </div>

              <div className="rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-emerald-500/30 p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-widest relative z-10">Collected</p>
                <p className="text-3xl font-black text-emerald-400 mt-2 relative z-10">
                  ₹{feeSummary.paid.toLocaleString()}
                </p>
              </div>

              <div className="rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-rose-500/30 p-6 shadow-[0_0_20px_rgba(244,63,94,0.1)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
                <p className="text-rose-400/80 text-sm font-bold uppercase tracking-widest relative z-10">Pending</p>
                <p className="text-3xl font-black text-rose-400 mt-2 relative z-10">
                  ₹{feeSummary.pending.toLocaleString()}
                </p>
              </div>
            </div>

            <SectionCard title="Financial Ledger" subtitle="Update fee record statuses and review balances.">
              {fees.length === 0 ? (
                <EmptyState text="No fee records found." />
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {fees.map((f) => (
                    <div
                      key={f._id}
                      className="rounded-[2rem] border border-slate-700/50 bg-slate-900/40 p-6 relative overflow-hidden shadow-lg hover:border-cyan-500/20 transition-colors"
                    >
                      <div
                        className={`absolute -top-8 -right-8 w-28 h-28 blur-[50px] rounded-full ${
                          f.status === "paid"
                            ? "bg-emerald-500/30"
                            : f.status === "partial"
                            ? "bg-amber-500/30"
                            : "bg-rose-500/30"
                        }`}
                      />

                      <div className="relative z-10">
                        <p className="text-white font-black text-lg truncate">
                          {f.studentName || "Student"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                          {f.studentEmail || ""}
                        </p>

                        <div className="mt-4 space-y-2">
                           <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                              <p className="text-xs font-bold text-slate-500">Amount:</p>
                              <p className="text-sm font-black text-white">₹{(f.amount || f.totalAmount || 0).toLocaleString()}</p>
                           </div>
                           
                           <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                              <p className="text-xs font-bold text-slate-500">Paid:</p>
                              <p className="text-sm font-black text-emerald-400">₹{(f.amountPaid || 0).toLocaleString()}</p>
                           </div>

                           <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                              <p className="text-xs font-bold text-slate-500">Balance:</p>
                              <p className="text-sm font-black text-rose-400">₹{Math.max((f.totalAmount || f.amount || 0) - (f.amountPaid || 0), 0).toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                           <p className="text-xs font-medium text-slate-500">Due: {formatDate(f.dueDate)}</p>
                           <p className="text-xs font-medium text-slate-500">Class: {f.className || "—"}</p>
                        </div>

                        <span
                          className={`inline-block mt-4 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner ${
                            f.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : f.status === "partial"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : f.status === "overdue"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-800/80 text-slate-300 border-slate-600"
                          }`}
                        >
                          {f.status}
                        </span>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateFeeStatus(f._id, "paid")}
                            className="px-3 py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-[10px] uppercase tracking-widest font-black transition-all"
                          >
                            Set Paid
                          </button>

                          <button
                            onClick={() => updateFeeStatus(f._id, "partial")}
                            className="px-3 py-2.5 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[10px] uppercase tracking-widest font-black transition-all"
                          >
                            Set Partial
                          </button>
                          
                          <button
                            onClick={() => updateFeeStatus(f._id, "pending")}
                            className="col-span-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 text-[10px] uppercase tracking-widest font-black transition-all shadow-inner"
                          >
                            Reset to Pending
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeUp">
            {[
              { title: "Student Report", desc: "Export student records", rows: students, name: "students_report" },
              { title: "Faculty Report", desc: "Export faculty records", rows: teachers, name: "faculty_report" },
              { title: "Department Report", desc: "Export departments", rows: departments, name: "department_report" },
              { title: "Program Report", desc: "Export programs", rows: programs, name: "program_report" },
              { title: "Attendance Report", desc: "Export low attendance", rows: lowAttendance, name: "attendance_report" },
              { title: "Fees Report", desc: "Export fees ledger", rows: fees, name: "fees_report" },
            ].map((r, i) => (
              <div
                key={i}
                className="rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-6 shadow-xl hover:border-cyan-500/30 transition-colors group"
              >
                <h3 className="text-white font-bold text-lg group-hover:text-cyan-50 transition-colors">{r.title}</h3>
                <p className="text-slate-400 font-medium text-sm mt-2 mb-6">{r.desc}</p>

                <button
                  onClick={() => exportCSV(r.name, r.rows)}
                  className="w-full px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-cyan-600/20 border border-slate-600 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 text-sm font-black uppercase tracking-widest transition-all shadow-inner"
                >
                  Download CSV
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fadeUp">
            <SectionCard title="Broadcast Announcement" subtitle="Send institution-wide or targeted notices.">
              <textarea
                rows={6}
                className="w-full rounded-2xl bg-slate-950/50 border border-slate-700/50 px-4 py-4 text-white resize-none mb-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                placeholder="Write announcement message..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              />

              <div className="grid md:grid-cols-[1fr_auto] gap-4">
                <select
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                  value={announcementTarget}
                  onChange={(e) => setAnnouncementTarget(e.target.value)}
                >
                  <option className="bg-slate-900" value="all">All Users</option>
                  <option className="bg-slate-900" value="students">Students</option>
                  <option className="bg-slate-900" value="teachers">Faculty</option>
                  <option className="bg-slate-900" value="admins">Admins</option>
                </select>

                <button
                  onClick={sendAnnouncement}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest uppercase text-sm px-6 py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
                >
                  Send Announcement
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Announcement Feed" subtitle="Most recent institutional communications.">
              {announcements.length === 0 ? (
                <EmptyState text="No announcements available." />
              ) : (
                <div className="space-y-3">
                  {announcements.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                          {item.target || "all"}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{formatDate(item.createdAt)}</span>
                      </div>

                      <p className="text-white text-sm font-medium leading-relaxed">
                        {item.message || item.title || "Announcement"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* AUDIT */}
        {activeTab === "audit" && (
          <SectionCard
            title="Audit Trail"
            subtitle="System logs and accountability events."
            className="animate-fadeUp"
            action={
              <button
                onClick={() => exportCSV("audit_logs", auditLogs)}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-sm font-bold text-slate-200 transition-colors shadow-inner"
              >
                Export CSV
              </button>
            }
          >
            {auditLogs.length === 0 ? (
              <EmptyState text="No audit logs available." />
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner hover:border-cyan-500/20 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{log.action || log.message || "Audit event"}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          {log.actorName || log.user?.name || log.email || "System"} • {formatDate(log.createdAt)}
                        </p>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-[10px] uppercase font-black tracking-widest text-slate-400 shadow-inner">
                        {log.module || log.type || "general"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fadeUp">
            <SectionCard title="Platform Settings" subtitle="Update institutional display and policy values.">
              <div className="grid gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    University Name
                  </label>
                  <input
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                    value={settings.universityName}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, universityName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Current Session
                  </label>
                  <input
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                    value={settings.currentSession}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, currentSession: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Attendance Threshold (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                    value={settings.attendanceThreshold}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        attendanceThreshold: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Currency
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium appearance-none"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, currency: e.target.value }))
                    }
                  >
                    <option className="bg-slate-900" value="INR">INR</option>
                    <option className="bg-slate-900" value="USD">USD</option>
                    <option className="bg-slate-900" value="EUR">EUR</option>
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
                >
                  Save Global Settings
                </button>
              </div>
            </SectionCard>

            <SectionCard title="System Overview" subtitle="Administrative configuration summary and reminders.">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">
                    Current Session
                  </p>
                  <p className="text-white font-bold text-lg">{settings.currentSession}</p>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">
                    Attendance Threshold
                  </p>
                  <p className="text-cyan-400 font-bold text-lg">{settings.attendanceThreshold}%</p>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">
                    Reporting Currency
                  </p>
                  <p className="text-white font-bold text-lg">{settings.currency}</p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-sm font-medium text-cyan-200/80 leading-relaxed shadow-inner">
                  These settings are used across administrative displays and downstream modules.
                  Saving updates here will keep the dashboard aligned with the active institutional configuration.
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-30px) scale(1.05); }
            }
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(40px) scale(0.95); }
            }
            @keyframes fadeUp {
              0% { opacity: 0; transform: translateY(16px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite 2s; }
            .animate-fadeUp { animation: fadeUp .45s ease-out both; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </div>
  );
}