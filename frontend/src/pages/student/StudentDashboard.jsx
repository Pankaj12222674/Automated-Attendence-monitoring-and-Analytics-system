import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";
const API = "http://localhost:8000/api";

const Icons = {
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Qr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  ),
  AcademicCap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  ),
  Currency: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  Refresh: ({ spinning = false }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 1020 12"
      />
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
      />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 21h18M5 21V7l8-4 6 3v15M9 9h.01M9 12h.01M9 15h.01M13 9h.01M13 12h.01M13 15h.01M17 12h.01M17 15h.01"
      />
    </svg>
  ),
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const getAttendanceTone = (percent) => {
  if (percent >= 85) return "excellent";
  if (percent >= 75) return "good";
  if (percent >= 60) return "warning";
  return "critical";
};

const toneClasses = {
  excellent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/15",
  good: "text-indigo-300 border-indigo-500/30 bg-indigo-500/15",
  warning: "text-amber-300 border-amber-500/30 bg-amber-500/15",
  critical: "text-rose-400 border-rose-500/30 bg-rose-500/15",
};

const getTodayName = () =>
  new Date().toLocaleString("en-US", { weekday: "long" });

async function fetchFirstSuccessful(api, endpoints, config = {}) {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      return await api.get(endpoint, config);
    } catch (err) {
      lastError = err;
      if (err?.response?.status === 401) throw err;
    }
  }

  throw lastError || new Error("All candidate endpoints failed.");
}

function StatCard({ icon, label, value, subtext, accent = "indigo" }) {
  const accentMap = {
    indigo: "from-indigo-500/20 to-violet-500/10 text-indigo-300 border-indigo-500/20",
    emerald: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/20",
    purple: "from-purple-500/20 to-fuchsia-500/10 text-purple-300 border-purple-500/20",
    amber: "from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/20",
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent] || accentMap.indigo} opacity-30`} />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{label}</p>
          <p className="text-2xl font-black text-white mt-2 tracking-tight">{value}</p>
          {subtext ? <p className="text-xs text-slate-400 mt-1">{subtext}</p> : null}
        </div>
        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function StudentDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const api = useMemo(() => {
    return axios.create({
      baseURL: API,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [subjectComparison, setSubjectComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [fees, setFees] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [pageError, setPageError] = useState("");

  const firstName = useMemo(() => {
    return profile?.name?.split(" ")?.[0] || "Student";
  }, [profile]);

  const assignedClassName = useMemo(() => {
    return (
      profile?.classId?.name ||
      profile?.className ||
      subjects?.[0]?.classId?.name ||
      (typeof profile?.classId === "string" ? profile.classId : "") ||
      "Class not assigned"
    );
  }, [profile, subjects]);

  const todayName = useMemo(() => getTodayName(), []);

  const todayClasses = useMemo(() => {
    return (Array.isArray(timetable) ? timetable : []).filter((item) => item?.day === todayName);
  }, [timetable, todayName]);

  const overallPercent = useMemo(() => {
    if (!subjects.length) return 0;
    const total = subjects.reduce((acc, sub) => {
      const s = summary?.[sub.name] || {};
      return acc + (s.total ? (s.present / s.total) * 100 : 0);
    }, 0);
    return Math.round(total / subjects.length);
  }, [subjects, summary]);

  const lowAttendanceCount = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      const s = summary?.[subject.name] || {};
      const percent = s.total ? Math.round((s.present / s.total) * 100) : 0;
      return acc + (percent < 75 ? 1 : 0);
    }, 0);
  }, [subjects, summary]);

  const upcomingCount = assignments.length;
  const outstandingBalance = fees?.balance || 0;
  const attendanceTone = getAttendanceTone(overallPercent);

  const loadData = useCallback(
    async ({ silent = false, signal } = {}) => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      setPageError("");

      try {
        const userRes = await api.get("/auth/me", { signal });
        const userData = userRes.data.user || userRes.data;
        setProfile(userData);

        const studentId = userData?._id;
        const classId = userData?.classId?._id || userData?.classId;

        if (!studentId) {
          throw new Error("Student ID missing from profile.");
        }

        const requests = [
          classId ? api.get(`/class/subjects/${classId}`, { signal }) : Promise.resolve(null),
          classId ? api.get(`/assignments/class/${classId}`, { signal }) : Promise.resolve(null),
          classId
            ? fetchFirstSuccessful(
                api,
                [
                  `/admin/student-timetable/${classId}`,
                  `/student/timetable/${classId}`,
                  `/admin/class-timetable/${classId}`,
                  `/admin/teacher-timetable/${classId}`,
                ],
                { signal }
              )
            : Promise.resolve(null),
          fetchFirstSuccessful(
            api,
            ["/admin/announcements", "/announcements", "/student/announcements"],
            { signal }
          ),
          api.get(`/student/attendance/summary/${studentId}`, { signal }),
          api.get(`/student/attendance/history/${studentId}`, { signal }),
          api.get(`/student/attendance/analytics/${studentId}`, { signal }),
          api.get(`/fees/my-fees`, { signal }),
        ];

        const [
          subjectsRes,
          assignmentsRes,
          timetableRes,
          announcementsRes,
          summaryRes,
          historyRes,
          analyticsRes,
          feesRes,
        ] = await Promise.allSettled(requests);

        // Subjects
        if (subjectsRes.status === "fulfilled" && subjectsRes.value) {
          setSubjects(subjectsRes.value.data.subjects || []);
        } else {
          setSubjects([]);
        }

        // Assignments
        if (assignmentsRes.status === "fulfilled" && assignmentsRes.value) {
          const assignData = assignmentsRes.value.data.assignments || [];
          const upcoming = assignData
            .filter((a) => new Date(a.dueDate) > new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);
          setAssignments(upcoming);
        } else {
          setAssignments([]);
          if (assignmentsRes.status === "rejected") {
            console.error("Assignments load failed", assignmentsRes.reason);
          }
        }

        // Timetable
        if (timetableRes.status === "fulfilled" && timetableRes.value) {
          const raw = timetableRes.value.data;
          const slots =
            raw?.timetable ||
            raw?.entries ||
            raw?.schedule ||
            (Array.isArray(raw) ? raw : []);
          setTimetable(Array.isArray(slots) ? slots : []);
        } else {
          setTimetable([]);
          if (timetableRes.status === "rejected") {
            console.error("Timetable load failed", timetableRes.reason);
          }
        }

        // Announcements
        if (announcementsRes.status === "fulfilled" && announcementsRes.value) {
          const raw = announcementsRes.value.data;
          const list = raw?.announcements || raw?.items || (Array.isArray(raw) ? raw : []);
          setAnnouncements(Array.isArray(list) ? list.slice(0, 5) : []);
        } else {
          setAnnouncements([]);
          if (announcementsRes.status === "rejected") {
            console.error("Announcements load failed", announcementsRes.reason);
          }
        }

        // Attendance summary
        if (summaryRes.status === "fulfilled") {
          setSummary(summaryRes.value.data || {});
        } else {
          setSummary({});
          console.error("Attendance summary failed", summaryRes.reason);
        }

        // Attendance history
        if (historyRes.status === "fulfilled") {
          setAttendanceHistory(historyRes.value.data || []);
        } else {
          setAttendanceHistory([]);
          console.error("Attendance history failed", historyRes.reason);
        }

        // Analytics
        if (analyticsRes.status === "fulfilled") {
          const analytics = analyticsRes.value.data || {};
          setMonthlyData(analytics.monthly || []);
          setSubjectComparison(analytics.subjects || []);
        } else {
          setMonthlyData([]);
          setSubjectComparison([]);
          console.error("Attendance analytics failed", analyticsRes.reason);
        }

        // Fees
        if (feesRes.status === "fulfilled") {
          const feeData = feesRes.value.data.fees || [];
          const totalOwed = feeData.reduce(
            (acc, f) => acc + ((f.totalAmount || 0) - (f.amountPaid || 0)),
            0
          );
          setFees({
            balance: totalOwed,
            count: feeData.filter((f) => f.status !== "paid").length,
          });
        } else {
          setFees(null);
          console.error("Fees load failed", feesRes.reason);
        }
      } catch (err) {
        if (axios.isCancel?.(err) || err?.name === "CanceledError") return;

        console.error(err);
        setPageError("Unable to load dashboard data. Please try refreshing.");

        if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, navigate, token]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData({ signal: controller.signal });
    return () => controller.abort();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData({ silent: true });
  }, [loadData]);

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "transform 0.1s ease-out";
  }, []);

  const handleMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-400 font-medium mt-6 tracking-widest uppercase text-sm animate-pulse">
          Initializing 3D Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Floating 3D Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-float-delayed"></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[90rem] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
              <Icons.AcademicCap />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block truncate">
              Nexus<span className="text-indigo-400 font-light">Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition backdrop-blur-sm inline-flex items-center gap-2"
            >
              <Icons.Refresh spinning={refreshing} />
              Refresh
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition backdrop-blur-sm"
            >
              End Session
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 pt-8">
        {/* Error Banner */}
        {pageError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {pageError}
          </div>
        ) : null}

        {/* HERO */}
        <div
          className="relative mb-8 rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-gradient-to-br from-slate-900 to-[#12182b] border-t border-l border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-transform duration-500 will-change-transform"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
            <div className="flex items-center gap-6 min-w-0">
              <div className="relative group perspective-1000 shrink-0">
                <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <img
                  src={
                    profile?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Student")}&background=4f46e5&color=fff`
                  }
                  alt={`${profile?.name || "Student"} profile`}
                  className="relative w-28 h-28 rounded-3xl object-cover border-2 border-white/10 shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2 truncate">
                  Welcome, {firstName}
                </h1>

                <p className="text-indigo-400 font-medium text-lg mb-4">
                  {profile?.programId?.name || "Undeclared Major"} • Semester {profile?.currentSemester || 1}
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-slate-950/50 backdrop-blur-md border border-white/5 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2 shadow-inner">
                    <Icons.User /> {profile?.roll || "Pending ID"}
                  </span>

                  <span className="px-4 py-1.5 bg-slate-950/50 backdrop-blur-md border border-white/5 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2 shadow-inner">
                    <Icons.Building /> {assignedClassName}
                  </span>

                  <span
                    className={`px-4 py-1.5 backdrop-blur-md rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] border ${
                      toneClasses[attendanceTone]
                    }`}
                  >
                    <Icons.ShieldCheck />
                    {overallPercent >= 75 ? "Good Standing" : "Attention Needed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              <button
                onClick={() => navigate("/student/qr-scan")}
                className="group relative overflow-hidden bg-indigo-600 rounded-3xl p-5 flex flex-col items-center justify-center min-w-[170px] transform hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(79,70,229,0.4)] border-t border-white/20"
                aria-label="Open QR scan"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 group-hover:animate-pulse"></div>
                <div className="relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 text-white backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-500">
                  <Icons.Qr />
                </div>
                <span className="font-black tracking-widest uppercase text-xs text-white relative z-10">
                  Scan Optics
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<Icons.TrendingUp />}
            label="Overall Attendance"
            value={`${overallPercent}%`}
            subtext={subjects.length ? `${subjects.length} active modules` : "No registered modules"}
            accent="indigo"
          />
          <StatCard
            icon={<Icons.Book />}
            label="Low Compliance Modules"
            value={lowAttendanceCount}
            subtext={lowAttendanceCount ? "Needs attention" : "All modules healthy"}
            accent="amber"
          />
          <StatCard
            icon={<Icons.Document />}
            label="Upcoming Tasks"
            value={upcomingCount}
            subtext={upcomingCount ? "Next due items loaded" : "No pending assignments"}
            accent="purple"
          />
          <StatCard
            icon={<Icons.Currency />}
            label="Outstanding Balance"
            value={formatCurrency(outstandingBalance)}
            subtext={fees?.count ? `${fees.count} unpaid item(s)` : "No pending bursar items"}
            accent="emerald"
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-8 animate-fadeUp">
            {/* Analytics row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Attendance Trend */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/20 transition-colors duration-500">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div>
                    <h3 className="font-bold text-white text-lg">Bio-Metric Trend</h3>
                    <p className="text-xs text-slate-400">Semester progression overview</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-3xl font-black ${
                        overallPercent >= 75
                          ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                          : "text-rose-400"
                      }`}
                    >
                      {overallPercent}%
                    </p>
                  </div>
                </div>

                <div className="h-48 -mx-2 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          cursor={{ stroke: "#4f46e5", strokeWidth: 1, strokeDasharray: "5 5" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke="#818cf8"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorPercent)"
                          activeDot={{ r: 6, fill: "#fff", stroke: "#818cf8", strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500">
                      Awaiting log data
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col hover:border-indigo-500/20 transition-colors duration-500">
                <div className="mb-6">
                  <h3 className="font-bold text-white text-lg">Module Analysis</h3>
                  <p className="text-xs text-slate-400">Subject-wise compliance distribution</p>
                </div>

                <div className="flex-1 min-h-[190px] -mx-2">
                  {subjectComparison.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectComparison}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                          dataKey="subject"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 10 }}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          cursor={{ fill: "#1e293b" }}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="percentage" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500">
                      No courses available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modules */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                  <Icons.Book /> Enrolled Modules
                </h2>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                  {subjects.length} total
                </p>
              </div>

              {subjects.length === 0 ? (
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-10 text-center text-slate-500 shadow-inner">
                  You are not currently registered for any modules this semester.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {subjects.map((subject) => {
                    const s = summary?.[subject.name] || {};
                    const present = s.present || 0;
                    const total = s.total || 0;
                    const percent = total ? Math.round((present / total) * 100) : 0;
                    const isLow = percent < 75;

                    return (
                      <div
                        key={subject._id}
                        className="group bg-slate-900/80 backdrop-blur-md border-t border-l border-white/5 rounded-3xl p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-6 gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded inline-block mb-2 border border-indigo-500/20">
                              {subject.code || "NO-CODE"}
                            </p>
                            <h3 className="font-bold text-white text-lg leading-tight mb-1 truncate">{subject.name}</h3>
                            <p className="text-slate-500 text-xs font-medium">
                              {subject.credits} Credits • Prof. {subject.teacherId?.name?.split(" ")?.[0] || "TBA"}
                            </p>
                          </div>

                          <div
                            className={`px-3 py-1.5 rounded-xl text-sm font-black border shadow-inner shrink-0 ${
                              isLow
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {percent}%
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="rounded-2xl bg-slate-950/70 border border-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Present</p>
                            <p className="text-lg font-black text-white mt-1">{present}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-950/70 border border-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Sessions</p>
                            <p className="text-lg font-black text-white mt-1">{total}</p>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isLow
                                  ? "bg-gradient-to-r from-rose-600 to-rose-400"
                                  : "bg-gradient-to-r from-indigo-600 to-indigo-400"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/student/details?subject=${encodeURIComponent(subject.name)}`)}
                          className="mt-6 w-full py-3 bg-slate-950 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                        >
                          Access Portal
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6 animate-fadeUp delay-100">
            {/* Assigned Class */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Assigned Class</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Cohort
                </span>
              </div>

              <div className="rounded-2xl bg-slate-950/70 border border-white/5 p-4">
                <p className="text-white font-semibold text-base">{assignedClassName}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Semester {profile?.currentSemester || 1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Program: {profile?.programId?.name || "Not assigned"}
                </p>
              </div>
            </div>

            {/* Timetable */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Today’s Timetable</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {todayName}
                </span>
              </div>

              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.slice(0, 5).map((slot, idx) => (
                    <div
                      key={slot._id || `${slot.day}-${slot.time}-${idx}`}
                      className="rounded-2xl bg-slate-950/70 border border-white/5 p-4"
                    >
                      <p className="text-white font-semibold text-sm">
                        {slot.subjectName || slot.subjectId?.name || slot.subject?.name || "Class Session"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{slot.time || "Scheduled time"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                  <p className="text-slate-500 text-sm font-medium">No timetable sessions for today.</p>
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Icons.Bell /> Announcements
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Latest
                </span>
              </div>

              {announcements.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-auto pr-1 custom-scrollbar">
                  {announcements.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="rounded-2xl bg-slate-950/70 border border-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                          {item.target || "all"}
                        </span>
                        <span className="text-[10px] text-slate-500">{formatDate(item.createdAt)}</span>
                      </div>

                      <p className="text-sm text-white font-medium leading-relaxed">
                        {item.message || item.title || "Announcement"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                  <p className="text-slate-500 text-sm font-medium">No announcements available.</p>
                </div>
              )}
            </div>

            {/* LMS Widget */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                  <Icons.Document /> LMS Action Items
                </h3>
                {upcomingCount > 0 ? (
                  <span className="text-[10px] px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 font-black uppercase tracking-widest">
                    {upcomingCount} upcoming
                  </span>
                ) : null}
              </div>

              <div className="relative z-10">
                {assignments.length > 0 ? (
                  <div className="relative pl-4 border-l-2 border-slate-800 space-y-5">
                    {assignments.map((task) => (
                      <div
                        key={task._id}
                        className="relative group cursor-pointer"
                        onClick={() => navigate("/student/assignments")}
                      >
                        <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0b0f19] bg-indigo-500 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                          {task.subjectId?.name || "Coursework"}
                        </p>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Due: {formatDate(task.dueDate)}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate("/student/assignments")}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest mt-4 inline-block"
                    >
                      View All Tasks →
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                    <p className="text-slate-500 text-sm font-medium">All caught up. No pending LMS syncs.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bursar Widget */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-t border-l border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-500"></div>

              <h3 className="text-xs font-black text-indigo-300 mb-4 uppercase tracking-widest flex items-center gap-2 relative z-10">
                <Icons.Currency /> Bursar Account
              </h3>

              <div className="relative z-10">
                {fees ? (
                  <>
                    <p className="text-4xl font-black text-white mb-1 tracking-tight">
                      {formatCurrency(fees.balance)}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Current Outstanding
                    </p>
                    <p className="text-xs text-slate-500 mb-6">
                      {fees.count ? `${fees.count} pending fee record(s)` : "All dues cleared"}
                    </p>
                    <button
                      onClick={() => navigate("/student/bursar")}
                      className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                    >
                      {fees.balance > 0 ? "Resolve Balance" : "View Statements"}
                    </button>
                  </>
                ) : (
                  <div>
                    <SkeletonBlock className="h-10 w-40 mb-3" />
                    <SkeletonBlock className="h-3 w-32 mb-6" />
                    <SkeletonBlock className="h-11 w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Mini Widget */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Attendance Stream</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {attendanceHistory.length} records
                </span>
              </div>

              {attendanceHistory.length > 0 ? (
                <div className="space-y-3 max-h-[260px] overflow-auto pr-1 custom-scrollbar">
                  {attendanceHistory.slice(0, 6).map((item, idx) => (
                    <div
                      key={item._id || `${item.date}-${idx}`}
                      className="rounded-2xl bg-slate-950/70 border border-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-semibold truncate">
                            {item.subjectId?.name || item.subject?.name || item.subjectName || "Session"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(item.date)}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            item.status === "present" || item.status === "late"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/20"
                          }`}
                        >
                          {item.status || "logged"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                  <p className="text-slate-500 text-sm font-medium">No attendance stream available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
          .animate-fadeUp { animation: fadeUp .55s ease-out both; }
          .delay-100 { animation-delay: .1s; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.25);
            border-radius: 999px;
          }
        `,
        }}
      />
    </div>
  );
}

