import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIClient from "../../api";

const Icons = {
  Dashboard: () => <span className="text-lg">🧭</span>,
  Users: () => <span className="text-lg">👥</span>,
  Faculty: () => <span className="text-lg">🧑‍🏫</span>,
  Class: () => <span className="text-lg">🏫</span>,
  Book: () => <span className="text-lg">📚</span>,
  Bell: () => <span className="text-lg">🔔</span>,
  TrendingUp: () => <span className="text-lg">📈</span>,
  University: () => <span className="text-lg">🎓</span>,
  Alert: () => <span className="text-lg">⚠️</span>,
  ShieldCheck: () => <span className="text-lg">🛡️</span>,
  Money: () => <span className="text-lg">💳</span>,
  Settings: () => <span className="text-lg">⚙️</span>,
  Report: () => <span className="text-lg">📄</span>,
  Refresh: () => <span className="text-lg">🔄</span>,
  Spark: () => <span className="text-lg">✨</span>,
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
    className={`bg-slate-900/65 backdrop-blur-xl border border-white/[0.06] rounded-[2rem] shadow-xl ${className}`}
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 md:px-8 pt-6 md:pt-8 mb-5">
      <div>
        <h3 className="text-white text-lg font-bold tracking-tight">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    <div className="px-6 md:px-8 pb-6 md:pb-8">{children}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-8 text-center text-slate-500">
    {text}
  </div>
);

const StatTile = ({ label, value, icon, accent, color }) => (
  <div
    className={`bg-gradient-to-br ${accent} bg-slate-900/60 border border-white/[0.06] rounded-[2rem] p-6 shadow-xl hover:-translate-y-1 transition`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">
          {label}
        </p>
        <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-950/60 border border-white/10 ${color}`}
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
    universityName: "My University",
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
      color: "from-emerald-500/20 to-emerald-700/5",
    },
    {
      title: "Add Faculty",
      subtitle: "Provision a teacher account",
      tab: "faculty",
      color: "from-purple-500/20 to-purple-700/5",
    },
    {
      title: "Create Program",
      subtitle: "Expand university structure",
      tab: "university",
      color: "from-blue-500/20 to-blue-700/5",
    },
    {
      title: "Schedule Lecture",
      subtitle: "Add timetable block",
      tab: "academics",
      color: "from-amber-500/20 to-amber-700/5",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <p className="mt-5 text-sm uppercase tracking-[0.25em] text-violet-400 font-bold">
            Booting University Command Center
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 overflow-hidden relative selection:bg-violet-500/20">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] bg-violet-600/15 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 -left-24 w-[32rem] h-[32rem] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-fuchsia-500/10 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl">
        <div className="max-w-[98rem] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.35)] text-2xl font-black">
              U
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black text-xl tracking-tight truncate">
                {settings.universityName || "University"} • Admin OS
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-400">
                  Session {settings.currentSession}
                </span>
                <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  System Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={loadAdminData}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-sm font-bold transition disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <Icons.Refresh /> Refresh
              </span>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-4 md:px-6 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-sm font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[98rem] mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {/* Top banner */}
        <div className="mb-6 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-cyan-500/10 border border-white/[0.06] rounded-[2rem] p-6 md:p-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-56 h-56 bg-violet-500/10 rounded-full blur-[90px]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.25em] text-violet-300 mb-4">
                <Icons.Spark /> Command Center
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Advanced University Administration Dashboard
              </h2>
              <p className="text-slate-300 max-w-3xl mt-3 text-sm md:text-base leading-relaxed">
                Manage academic operations, enrollments, faculty, attendance trends, financial
                records, and global announcements from one premium control surface.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full lg:min-w-[32rem]">
              {quickActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(item.tab)}
                  className={`text-left rounded-2xl p-4 border border-white/10 bg-gradient-to-br ${item.color} hover:-translate-y-0.5 transition shadow-lg`}
                >
                  <p className="text-white font-bold text-sm">{item.title}</p>
                  <p className="text-slate-400 text-xs mt-1">{item.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 px-5 py-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto hide-scrollbar">
          <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] backdrop-blur-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 md:px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-violet-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
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
                  accent: "from-blue-500/15 to-blue-700/5",
                  color: "text-blue-400",
                },
                {
                  label: "Total Faculty",
                  value: stats.totalTeachers,
                  icon: <Icons.Faculty />,
                  accent: "from-purple-500/15 to-purple-700/5",
                  color: "text-purple-400",
                },
                {
                  label: "Active Classes",
                  value: stats.totalClasses,
                  icon: <Icons.Class />,
                  accent: "from-emerald-500/15 to-emerald-700/5",
                  color: "text-emerald-400",
                },
                {
                  label: "Attendance",
                  value: `${stats.overallAttendance || 0}%`,
                  icon: <Icons.TrendingUp />,
                  accent: "from-amber-500/15 to-amber-700/5",
                  color: "text-amber-400",
                },
                {
                  label: "Departments",
                  value: stats.totalDepartments,
                  icon: <Icons.University />,
                  accent: "from-cyan-500/15 to-cyan-700/5",
                  color: "text-cyan-400",
                },
                {
                  label: "Programs",
                  value: stats.totalPrograms,
                  icon: <Icons.Book />,
                  accent: "from-pink-500/15 to-pink-700/5",
                  color: "text-pink-400",
                },
                {
                  label: "Pending Approvals",
                  value: stats.pendingApprovals,
                  icon: <Icons.Alert />,
                  accent: "from-rose-500/15 to-rose-700/5",
                  color: "text-rose-400",
                },
                {
                  label: "Fees Collected",
                  value: `₹${Math.max(stats.collectedFees || 0, feeSummary.paid).toLocaleString()}`,
                  icon: <Icons.Money />,
                  accent: "from-green-500/15 to-green-700/5",
                  color: "text-green-400",
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
                  <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-black">
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
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => approveUser(user._id)}
                            className="px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-black"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => rejectUser(user._id)}
                            className="px-3 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-black"
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
                        className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>

                        <span className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-black">
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
                        className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                      >
                        <p className="text-white text-sm">{log.message || "Activity logged"}</p>
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
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-4 outline-none focus:border-violet-500"
                  placeholder="Department Name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                />

                <select
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-6 outline-none focus:border-violet-500"
                  value={departmentHead}
                  onChange={(e) => setDepartmentHead(e.target.value)}
                >
                  <option value="">Head of Department (Optional)</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createDepartment}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition"
                >
                  Create Department
                </button>
              </SectionCard>

              <SectionCard title="Create Program" subtitle="Add a new program under a department.">
                <input
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-4 outline-none focus:border-blue-500"
                  placeholder="Program Name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                />

                <select
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-6 outline-none focus:border-blue-500"
                  value={programDept}
                  onChange={(e) => setProgramDept(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createProgram}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
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
                    className="px-4 py-2 rounded-xl bg-slate-800 text-sm"
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
                        className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                      >
                        <p className="text-white font-bold">{dept.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
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
                    className="px-4 py-2 rounded-xl bg-slate-800 text-sm"
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
                        className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                      >
                        <p className="text-white font-bold">{program.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
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
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  placeholder="Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />

                <input
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  placeholder="University Email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />

                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={studentProgram}
                  onChange={(e) => setStudentProgram(e.target.value)}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addStudent}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5"
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
                  <input
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="bg-slate-950 border border-white/10 px-4 py-2.5 rounded-xl text-white"
                  />
                  <button
                    onClick={() => exportCSV("students", filteredStudents)}
                    className="bg-slate-800 px-4 py-2.5 rounded-xl text-sm"
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
                      className="rounded-[2rem] border border-white/5 bg-slate-950/45 p-5 shadow-lg"
                    >
                      <p className="font-bold text-white text-lg">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{s.email}</p>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-900/80 p-3 border border-white/5">
                          <p className="text-slate-500">Reg No</p>
                          <p className="text-white font-bold mt-1">{s.roll || "N/A"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-900/80 p-3 border border-white/5">
                          <p className="text-slate-500">Semester</p>
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
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  placeholder="Full Name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />

                <input
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  placeholder="Email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                />

                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={teacherDepartment}
                  onChange={(e) => setTeacherDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addTeacher}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5"
                >
                  Add Faculty
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Faculty Directory"
              subtitle="Search, review, and export faculty profiles."
              action={
                <div className="flex gap-3">
                  <input
                    placeholder="Search teacher..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="bg-slate-950 border border-white/10 px-4 py-2.5 rounded-xl text-white"
                  />
                  <button
                    onClick={() => exportCSV("teachers", filteredTeachers)}
                    className="bg-slate-800 px-4 py-2.5 rounded-xl text-sm"
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
                      className="rounded-[2rem] border border-white/5 bg-slate-950/45 p-5 shadow-lg"
                    >
                      <p className="text-white font-bold text-lg">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{t.email}</p>

                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => deleteTeacher(t._id)}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-400 text-xs font-bold"
                        >
                          Delete
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
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-5"
                placeholder="Class / Cohort Name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />

              <button
                onClick={createClass}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5"
              >
                Create Class
              </button>
            </SectionCard>

            <SectionCard title="Assign Teacher to Class" subtitle="Link a faculty member to a cohort.">
              <select
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-4"
                value={assignClass}
                onChange={(e) => setAssignClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-5"
                value={assignTeacher}
                onChange={(e) => setAssignTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={assignTeacherToClass}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5"
              >
                Assign
              </button>
            </SectionCard>

            <SectionCard title="Create Subject" subtitle="Attach a subject to class and faculty.">
              <input
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-4"
                placeholder="Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />

              <select
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-4"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white mb-5"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={createSubject}
                className="w-full rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5"
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
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">Select Day</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={timeClass}
                  onChange={(e) => setTimeClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={timeSubject}
                  onChange={(e) => setTimeSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects
                    .filter((s) => String(s.classId?._id || s.classId) === String(timeClass))
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <button
                  onClick={createTimetable}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5"
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
                      <span className="w-24 text-xs font-bold uppercase tracking-widest text-slate-500">
                        {t.month}
                      </span>

                      <div className="flex-1 rounded-full h-3 bg-slate-950 border border-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400"
                          style={{ width: `${t.value}%` }}
                        />
                      </div>

                      <span className="w-12 text-right text-emerald-400 font-black">
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
                  className="px-4 py-2 rounded-xl bg-slate-800 text-sm"
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
                      className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-bold">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>

                      <span className="text-rose-400 font-black">{s.attendance}%</span>
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
                    className="rounded-[2rem] border border-white/5 bg-slate-950/45 p-6"
                  >
                    <p className="text-white font-black text-xl">
                      {s.name}
                      <span className="ml-3 px-3 py-1 rounded-lg border border-white/10 text-xs text-slate-400 font-mono">
                        {s.email}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5">
                      {subjects.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => alert(`Open marks entry for ${s.name} - ${sub.name}`)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600/20 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-indigo-400"
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
              <div className="rounded-[2rem] bg-slate-900/65 border border-white/[0.06] p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Total Fees</p>
                <p className="text-3xl font-black text-white mt-2">
                  ₹{feeSummary.total.toLocaleString()}
                </p>
              </div>

              <div className="rounded-[2rem] bg-slate-900/65 border border-white/[0.06] p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Collected</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">
                  ₹{feeSummary.paid.toLocaleString()}
                </p>
              </div>

              <div className="rounded-[2rem] bg-slate-900/65 border border-white/[0.06] p-6 shadow-xl">
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-3xl font-black text-rose-400 mt-2">
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
                      className="rounded-[2rem] border border-white/5 bg-slate-950/45 p-6 relative overflow-hidden"
                    >
                      <div
                        className={`absolute -top-8 -right-8 w-28 h-28 blur-[60px] rounded-full ${
                          f.status === "paid"
                            ? "bg-emerald-500/20"
                            : f.status === "partial"
                            ? "bg-amber-500/20"
                            : "bg-rose-500/20"
                        }`}
                      />

                      <div className="relative z-10">
                        <p className="text-white font-black text-lg">
                          {f.studentName || "Student"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          {f.studentEmail || ""}
                        </p>

                        <p className="text-sm text-slate-400 mt-3">
                          Amount: ₹{(f.amount || f.totalAmount || 0).toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500 mt-2">
                          Paid: ₹{(f.amountPaid || 0).toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Balance: ₹
                          {Math.max((f.totalAmount || f.amount || 0) - (f.amountPaid || 0), 0).toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">Due: {formatDate(f.dueDate)}</p>

                        <p className="text-xs text-slate-500 mt-1">Class: {f.className || "—"}</p>

                        <span
                          className={`inline-block mt-5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${
                            f.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : f.status === "partial"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : f.status === "overdue"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-500/10 text-slate-300 border-slate-500/20"
                          }`}
                        >
                          {f.status}
                        </span>

                        <div className="mt-5 flex gap-2 flex-wrap">
                          <button
                            onClick={() => updateFeeStatus(f._id, "paid")}
                            className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold"
                          >
                            Mark Paid
                          </button>

                          <button
                            onClick={() => updateFeeStatus(f._id, "pending")}
                            className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-200 text-xs font-bold"
                          >
                            Reset Pending
                          </button>

                          <button
                            onClick={() => updateFeeStatus(f._id, "partial")}
                            className="px-4 py-2 rounded-xl bg-amber-600/20 text-amber-400 text-xs font-bold"
                          >
                            Mark Partial
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
                className="rounded-[2rem] bg-slate-900/65 border border-white/[0.06] p-6 shadow-xl"
              >
                <h3 className="text-white font-bold text-lg">{r.title}</h3>
                <p className="text-slate-400 text-sm mt-2 mb-6">{r.desc}</p>

                <button
                  onClick={() => exportCSV(r.name, r.rows)}
                  className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold"
                >
                  Export CSV
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
                className="w-full rounded-2xl bg-slate-950 border border-white/10 px-4 py-4 text-white resize-none mb-4 outline-none focus:border-violet-500"
                placeholder="Write announcement message..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              />

              <div className="grid md:grid-cols-[1fr_auto] gap-4">
                <select
                  className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                  value={announcementTarget}
                  onChange={(e) => setAnnouncementTarget(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="teachers">Faculty</option>
                  <option value="admins">Admins</option>
                </select>

                <button
                  onClick={sendAnnouncement}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3.5"
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
                      className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-black uppercase tracking-widest">
                          {item.target || "all"}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                      </div>

                      <p className="text-white text-sm leading-relaxed">
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-sm"
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
                    className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold">{log.action || log.message || "Audit event"}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {log.actorName || log.user?.name || log.email || "System"} • {formatDate(log.createdAt)}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs font-mono text-slate-400">
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
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    University Name
                  </label>
                  <input
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                    value={settings.universityName}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, universityName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Current Session
                  </label>
                  <input
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                    value={settings.currentSession}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, currentSession: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Attendance Threshold
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Currency
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3.5 text-white"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, currency: e.target.value }))
                    }
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  className="w-full mt-2 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition"
                >
                  Save Settings
                </button>
              </div>
            </SectionCard>

            <SectionCard title="System Overview" subtitle="Administrative configuration summary and reminders.">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Current Session
                  </p>
                  <p className="text-white font-bold text-lg">{settings.currentSession}</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Attendance Threshold
                  </p>
                  <p className="text-white font-bold text-lg">{settings.attendanceThreshold}%</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Reporting Currency
                  </p>
                  <p className="text-white font-bold text-lg">{settings.currency}</p>
                </div>

                <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 text-sm text-slate-400 leading-relaxed">
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
            @keyframes fadeUp {
              0% { opacity: 0; transform: translateY(16px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeUp { animation: fadeUp .45s ease-out both; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </div>
  );
}