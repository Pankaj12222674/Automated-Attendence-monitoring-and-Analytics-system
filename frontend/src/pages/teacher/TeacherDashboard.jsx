import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance
import { buildFallbackAvatar, resolveProfileImage } from "../../utils/profileImage";

const Icons = {
  Class: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
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
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  UserGroup: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  QR: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  ),
  Beaker: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  ClipboardCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  FaceScan: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Refresh: ({ spinning = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 1020 12" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.65 18h16.7a1 1 0 00.86-1.5l-7.5-13a1 1 0 00-1.72 0z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.813-2.096L5 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904zM18 13l.75 1.75L20.5 15l-1.75.75L18 17.5l-.75-1.75L15.5 15l1.75-.25L18 13zM16 5l.938 2.563L19.5 8.5l-2.562.938L16 12l-.938-2.562L12.5 8.5l2.562-.938L16 5z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getAvatar(profile) {
  return resolveProfileImage(profile?.profileImage, profile?.name || "Professor");
}

function getMetricValue(item) {
  if (typeof item?.percentage === "number") return item.percentage;
  if (typeof item?.attendance === "number") return item.attendance;
  if (typeof item?.avgAttendance === "number") return item.avgAttendance;
  return null;
}

function matchBySubject(item, subject) {
  const subjectId = subject?._id;
  const subjectName = subject?.name;
  return (
    item?.subjectId === subjectId ||
    item?.subjectId?._id === subjectId ||
    item?.subject === subjectName ||
    item?.subjectName === subjectName ||
    item?.name === subjectName
  );
}

function StatCard({ icon, label, value, subtext, accent = "cyan" }) {
  const accentMap = {
    cyan: "from-cyan-500/20 to-blue-500/5 border-cyan-500/20 text-cyan-300",
    blue: "from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-300",
    emerald: "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-300",
    amber: "from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-300",
    rose: "from-rose-500/20 to-red-500/5 border-rose-500/20 text-rose-300",
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", accentMap[accent])} />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-bold">{label}</p>
          <p className="text-3xl font-black text-white mt-2 tracking-tight">{value}</p>
          {subtext ? <p className="text-xs text-slate-500 mt-2">{subtext}</p> : null}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionShell({ title, icon, right, children }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-8 text-center shadow-inner">
      <p className="text-white font-bold text-lg mb-2">{title}</p>
      <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-3 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function InsightCard({ title, body, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-slate-700/50 p-4 shadow-inner">
      <div className={cn("inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border mb-3", tones[tone])}>
        <Icons.Sparkles />
        {title}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [classAnalytics, setClassAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [query, setQuery] = useState("");
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profile?.profileImage]);

  // profile update settings
  const [advisingStudents, setAdvisingStudents] = useState(0);
  const [researchProjects, setResearchProjects] = useState([]);
  const [officeHours, setOfficeHours] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const currentDay = useMemo(
    () => new Date().toLocaleString("en-US", { weekday: "long" }),
    []
  );

  const facultyFirstName = useMemo(
    () => profile?.name?.split(" ")?.[0] || "Faculty",
    [profile]
  );

  const lecturesToday = useMemo(
    () => timetable.filter((item) => item?.day === currentDay).length,
    [timetable, currentDay]
  );

  const averageAttendance = useMemo(() => {
    const values = (Array.isArray(classAnalytics) ? classAnalytics : [])
      .map(getMetricValue)
      .filter((v) => typeof v === "number");

    if (!values.length) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  }, [classAnalytics]);

  const lowCoverageClasses = useMemo(() => {
    return (Array.isArray(classAnalytics) ? classAnalytics : []).filter((item) => {
      const value = getMetricValue(item);
      return typeof value === "number" && value < 75;
    }).length;
  }, [classAnalytics]);

  const todaySchedule = useMemo(() => {
    return timetable.filter((item) => item?.day === currentDay);
  }, [timetable, currentDay]);

  const filteredSubjects = useMemo(() => {
    const source = Array.isArray(subjects) ? subjects : [];
    if (!query.trim()) return source;

    const q = query.toLowerCase();
    return source.filter((s) => {
      const name = s?.name?.toLowerCase() || "";
      const code = s?.code?.toLowerCase() || "";
      const cohort = s?.classId?.name?.toLowerCase() || "";
      return name.includes(q) || code.includes(q) || cohort.includes(q);
    });
  }, [subjects, query]);

  const topAttentionSubjects = useMemo(() => {
    return (Array.isArray(subjects) ? subjects : [])
      .map((subject) => {
        const analytics = classAnalytics.find((item) => matchBySubject(item, subject));
        const value = getMetricValue(analytics);
        return {
          subject,
          value,
        };
      })
      .filter((x) => typeof x.value === "number")
      .sort((a, b) => a.value - b.value)
      .slice(0, 3);
  }, [subjects, classAnalytics]);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      setPageError("");

      let mounted = true;

      try {
        // Handled entirely by centralized api interceptor
        const userRes = await api.get("/api/auth/me");
        if (!mounted) return;

        const user = userRes.data.user || userRes.data;
        setProfile(user);
        
        setAdvisingStudents(user.advisingStudents || 0);
        setResearchProjects(user.researchProjects || []);
        setOfficeHours(user.officeHours || []);

        const teacherId = user?._id || user?.id;
        if (!teacherId) {
          setClasses([]);
          setSubjects([]);
          setTimetable([]);
          setClassAnalytics([]);
          return;
        }

        // Send all subsequent requests using relative paths through api instance
        const [classRes, timeRes, analyticsRes] = await Promise.allSettled([
          api.get(`/api/class/teacher/${teacherId}`),
          api.get(`/api/admin/teacher-timetable/${teacherId}`),
          api.get(`/api/attendance/teacher/classes`),
        ]);

        if (!mounted) return;

        if (classRes.status === "fulfilled") {
          setClasses(classRes.value.data.classes || []);
          setSubjects(classRes.value.data.subjects || []);
        } else {
          console.error("Teacher classes load failed", classRes.reason);
          setClasses([]);
          setSubjects([]);
        }

        if (timeRes.status === "fulfilled") {
          setTimetable(Array.isArray(timeRes.value.data) ? timeRes.value.data : []);
        } else {
          console.error("Timetable load failed", timeRes.reason);
          setTimetable([]);
        }

        if (analyticsRes.status === "fulfilled") {
          setClassAnalytics(Array.isArray(analyticsRes.value.data) ? analyticsRes.value.data : []);
        } else {
          console.error("Analytics load failed", analyticsRes.reason);
          setClassAnalytics([]);
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        setPageError("Unable to load the faculty dashboard right now. Please refresh and try again.");
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }

      return () => {
        mounted = false;
      };
    },
    [navigate, token]
  );

  useEffect(() => {
    loadDashboard();
  }, []);  // Empty dependency to run on mount
  
  // Force refresh when coming back from other pages
  useEffect(() => {
    const handleFocus = () => {
      loadDashboard({ silent: true });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadDashboard]);

  const handleRefresh = useCallback(() => {
    loadDashboard({ silent: true });
  }, [loadDashboard]);

  // non-breaking existing navigations
  const goManual = useCallback(
    (classId, subjectId, subjectName) =>
      navigate(`/teacher/manual-attendance?classId=${classId}&subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`),
    [navigate]
  );

  const generateQR = useCallback(
    (classId, subjectId, subjectName) =>
      navigate(`/teacher/generate-qr?classId=${classId}&subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`),
    [navigate]
  );

  const viewHistory = useCallback(
    (classId, subjectId, subjectName) =>
      navigate(`/teacher/attendance-history?classId=${classId}&subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`),
    [navigate]
  );

  const viewStudents = useCallback(
    (classId, name) =>
      navigate(`/teacher/class-students?classId=${classId}&name=${encodeURIComponent(name)}`),
    [navigate]
  );

  const goFace = useCallback(
    (classId, subjectId, subjectName) =>
      navigate(`/teacher/face-attendance?classId=${classId}&subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`),
    [navigate]
  );

  const handleGradeExams = useCallback(
    (classId, subjectId, subjectName) =>
      navigate(`/teacher/assignments?classId=${classId}&subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`),
    [navigate]
  );

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    card.style.transition = "transform 0.1s ease-out";
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    e.currentTarget.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-cyan-400 font-medium mt-6 tracking-widest uppercase text-sm animate-pulse">
          Initializing Faculty Command V2...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
      {/* Floating 3D Background Orbs & Grid */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-middle" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmurlCtncmlkKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none z-0" />

      {/* Top nav */}
      <nav className="relative z-50 bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl">
        <div className="max-w-[92rem] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
               <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-cyan-400">
                  <Icons.Briefcase />
               </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block truncate">
              Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Attendance</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              title="Refresh dashboard"
              aria-label="Refresh dashboard"
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-inner"
            >
              <Icons.Refresh spinning={refreshing} />
              Refresh
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-5 py-2 bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-slate-600 text-slate-200 text-sm font-bold rounded-xl transition-all shadow-inner"
            >
              End Session
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-[92rem] mx-auto px-6 pt-8">
        {pageError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <Icons.Alert />
            {pageError}
          </div>
        ) : null}

        {/* HERO */}
        <div
          className="relative mb-8 rounded-[2.75rem] p-8 md:p-12 overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl transition-transform duration-500 will-change-transform"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10 grid xl:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 min-w-0">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <img
                  src={profileImageFailed
                    ? buildFallbackAvatar(profile?.name || "Faculty")
                    : getAvatar(profile)}
                  alt={`${profile?.name || "Faculty"} profile`}
                  onError={() => setProfileImageFailed(true)}
                  className="relative w-32 h-32 rounded-3xl object-cover border-2 border-slate-700/80 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-[4px] border-[#0b0f19] flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
                  <Icons.Sparkles />
                  Faculty Command Active
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight leading-tight">
                  Prof. {profile?.name || "Faculty Member"}
                </h1>

                <p className="text-cyan-400 text-lg font-bold mt-3">
                  {profile?.department || "Department of Academic Staff"}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-slate-950/50 backdrop-blur-md border border-slate-700/50 rounded-lg text-xs font-bold text-slate-300 shadow-inner">
                    Operational Mode
                  </span>
                  <span className="px-4 py-1.5 bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 rounded-lg text-xs font-bold text-cyan-400">
                    Research Active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <div className="rounded-[1.75rem] p-5 bg-slate-950/70 border border-slate-700/50 backdrop-blur-md shadow-inner flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Faculty Alias</p>
                  <p className="text-xl font-black text-white">{facultyFirstName}</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Command access authenticated</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-4 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-inner"
                >
                  Edit Profile
                </button>
              </div>

              <div className="rounded-[1.75rem] p-5 bg-slate-950/70 border border-slate-700/50 backdrop-blur-md shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Today’s Load</p>
                <p className="text-xl font-black text-white">{lecturesToday} lecture{lecturesToday !== 1 ? "s" : ""}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{currentDay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8 animate-fadeUp">
          <StatCard
            icon={<Icons.Class />}
            label="Active Courses"
            value={classes.length}
            subtext="Assigned cohorts"
            accent="cyan"
          />
          <StatCard
            icon={<Icons.Book />}
            label="Subjects Taught"
            value={subjects.length}
            subtext="Teaching load"
            accent="blue"
          />
          <StatCard
            icon={<Icons.Clock />}
            label="Lectures Today"
            value={lecturesToday}
            subtext={currentDay}
            accent="amber"
          />
          <StatCard
            icon={<Icons.Briefcase />}
            label="Mentees"
            value={advisingStudents}
            subtext="Advising roster"
            accent="emerald"
          />
          <StatCard
            icon={<Icons.TrendingUp />}
            label="Avg Attendance"
            value={`${averageAttendance}%`}
            subtext={lowCoverageClasses ? `${lowCoverageClasses} attention item(s)` : "Healthy monitored classes"}
            accent={lowCoverageClasses ? "amber" : "cyan"}
          />
        </div>

        {/* COMMAND GRID */}
        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_360px] gap-8 mb-10">
          {/* LEFT MAIN */}
          <div className="space-y-8">
            <SectionShell
              title="Course Operations Desk"
              icon={<Icons.Book />}
              right={
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Search />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search subjects, code, cohort..."
                      className="w-[260px] max-w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                  <span className="hidden md:inline-flex text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-black uppercase tracking-widest">
                    {filteredSubjects.length} visible
                  </span>
                </div>
              }
            >
              {filteredSubjects.length === 0 ? (
                <EmptyState
                  title={subjects.length ? "No matching subjects" : "No assigned subjects found"}
                  description={
                    subjects.length
                      ? "Try a different search term for subject name, code, or cohort."
                      : "We couldn’t find any teaching subjects for your account right now. Refresh the dashboard or contact admin if this looks incorrect."
                  }
                  actionLabel={subjects.length ? "Clear Search" : "Refresh Dashboard"}
                  onAction={subjects.length ? () => setQuery("") : handleRefresh}
                />
              ) : (
                <div className="grid xl:grid-cols-2 gap-6">
                  {filteredSubjects.map((s) => {
                    const subjectAnalytics = classAnalytics.find((item) => matchBySubject(item, s)) || null;
                    const subjectAttendance = getMetricValue(subjectAnalytics);

                    const relatedSlots = timetable.filter(
                      (slot) =>
                        slot?.subjectId === s?._id ||
                        slot?.subjectId?._id === s?._id ||
                        slot?.subject === s?.name ||
                        slot?.subjectName === s?.name
                    );

                    const safePercent =
                      typeof subjectAttendance === "number"
                        ? Math.max(0, Math.min(100, Math.round(subjectAttendance)))
                        : null;

                    const healthTone =
                      typeof safePercent !== "number"
                        ? "pending"
                        : safePercent >= 85
                        ? "excellent"
                        : safePercent >= 75
                        ? "good"
                        : "warning";

                    return (
                      <div
                        key={s._id}
                        className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-7 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-cyan-500/30 transition-all duration-500 flex flex-col group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex justify-between items-start gap-4 mb-6">
                          <div className="min-w-0">
                            <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg shadow-inner">
                              {s.classId?.name || "COHORT"}
                            </span>

                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight break-words group-hover:text-cyan-50 transition-colors">
                              {s.name}
                            </h3>

                            <p className="text-slate-400 text-sm font-bold mt-2">
                              {s.code || "NO-CODE"} • {s.credits || 0} credits
                            </p>
                          </div>

                          <button
                            onClick={() => handleGradeExams(s.classId?._id, s._id, s.name)}
                            className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-cyan-600 border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white rounded-2xl transition-all duration-300 shadow-inner hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
                            title="Open LMS Grading Portal"
                            aria-label={`Open LMS grading portal for ${s.name}`}
                          >
                            <Icons.ClipboardCheck />
                            <span className="text-[9px] font-black uppercase tracking-widest mt-1">LMS</span>
                          </button>
                        </div>

                        <div className="relative z-10 grid sm:grid-cols-3 gap-3 mb-5">
                          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Class</p>
                            <p className="text-sm font-bold text-white truncate">{s.classId?.name || "Unassigned"}</p>
                          </div>

                          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Attendance</p>
                            <p
                              className={cn(
                                "text-sm font-black",
                                healthTone === "excellent" && "text-emerald-400",
                                healthTone === "good" && "text-cyan-300",
                                healthTone === "warning" && "text-amber-400",
                                healthTone === "pending" && "text-slate-400"
                              )}
                            >
                              {typeof safePercent === "number" ? `${safePercent}%` : "Pending"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Timetable</p>
                            <p className="text-sm font-bold text-white">{relatedSlots.length} slot{relatedSlots.length !== 1 ? "s" : ""}</p>
                          </div>
                        </div>

                        <div className="relative z-10 mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement Pulse</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {typeof safePercent === "number" ? `${safePercent}%` : "No signal"}
                            </p>
                          </div>

                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                healthTone === "excellent" && "bg-gradient-to-r from-emerald-600 to-teal-400",
                                healthTone === "good" && "bg-gradient-to-r from-cyan-600 to-blue-400",
                                healthTone === "warning" && "bg-gradient-to-r from-amber-600 to-orange-400",
                                healthTone === "pending" && "bg-gradient-to-r from-slate-700 to-slate-600"
                              )}
                              style={{
                                width: `${typeof safePercent === "number" ? safePercent : 20}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                            Secure Check-In Systems
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => goManual(s.classId?._id, s._id, s.name)}
                              className="py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-bold transition-colors shadow-inner flex items-center justify-center gap-2"
                            >
                              <Icons.UserGroup />
                              Roll Call
                            </button>

                            <button
                              onClick={() => generateQR(s.classId?._id, s._id, s.name)}
                              className="relative overflow-hidden py-3.5 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] group flex items-center justify-center gap-2"
                            >
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 group-hover:animate-pulse"></div>
                              <Icons.QR />
                              Live QR
                            </button>

                            <button
                              onClick={() => goFace(s.classId?._id, s._id, s.name)}
                              className="col-span-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 group overflow-hidden relative"
                            >
                              <div className="absolute left-0 w-full h-0.5 bg-white/50 blur-[1px] group-hover:animate-[scan_1.5s_ease-in-out_infinite]"></div>
                              <Icons.FaceScan />
                              Initialize AI Biometrics
                            </button>

                            <button
                              onClick={() => viewHistory(s.classId?._id, s._id, s.name)}
                              className="py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-inner"
                            >
                              Attendance Logs
                            </button>

                            <button
                              onClick={() => viewStudents(s.classId?._id, s.classId?.name || s.name)}
                              className="py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-inner"
                            >
                              Student Roster
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionShell>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <SectionShell
              title="Today’s Schedule"
              icon={<Icons.Clock />}
              right={
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-black uppercase tracking-widest">
                  {todaySchedule.length} item{todaySchedule.length !== 1 ? "s" : ""}
                </span>
              }
            >
              {todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.slice(0, 6).map((slot, idx) => (
                    <div key={slot._id || `${slot.day}-${slot.time}-${idx}`} className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {slot.subjectName || slot.subject?.name || slot.subject || "Lecture Slot"}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            {slot.className || slot.classId?.name || slot.class || "Assigned Cohort"}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                          {slot.time || "Scheduled"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-6 text-center shadow-inner">
                  <p className="text-sm font-medium text-slate-400">No timetable items for {currentDay}.</p>
                </div>
              )}
            </SectionShell>

            <SectionShell
              title="Priority Insights"
              icon={<Icons.TrendingUp />}
            >
              <div className="space-y-4">
                <InsightCard
                  title="Coverage Radar"
                  tone={lowCoverageClasses > 0 ? "amber" : "emerald"}
                  body={
                    lowCoverageClasses > 0
                      ? `${lowCoverageClasses} monitored class group(s) are below the preferred attendance threshold. A quick intervention this week may help stabilize class participation.`
                      : `Attendance coverage looks healthy across your monitored classes. No immediate interventions are indicated right now.`
                  }
                />

                <InsightCard
                  title="Teaching Load"
                  tone="cyan"
                  body={`You are currently managing ${subjects.length} subject${subjects.length !== 1 ? "s" : ""} across ${classes.length} active cohort${classes.length !== 1 ? "s" : ""}, with ${lecturesToday} lecture${lecturesToday !== 1 ? "s" : ""} scheduled for today.`}
                />

                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Attention Subjects</p>
                  {topAttentionSubjects.length > 0 ? (
                    <div className="space-y-2">
                      {topAttentionSubjects.map((item) => (
                        <button
                          key={item.subject._id}
                          onClick={() => viewHistory(item.subject.classId?._id, item.subject._id, item.subject.name)}
                          className="w-full rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/80 px-3 py-3 flex items-center justify-between gap-3 transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.subject.name}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">{item.subject.classId?.name || "Assigned Cohort"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-amber-400">{Math.round(item.value)}%</span>
                            <span className="text-slate-500">
                              <Icons.ChevronRight />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-500">No actionable subject signals available yet.</p>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              title="Office Hours"
              icon={<Icons.Clock />}
              right={
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-black uppercase tracking-widest">
                  {officeHours.length} slots
                </span>
              }
            >
              <div className="space-y-3">
                {officeHours.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner">
                    <div className="min-w-0">
                      <p className="font-bold text-white">{slot.day}</p>
                      <p className="text-xs font-medium text-slate-400 mt-1 break-words">{slot.location}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-black tracking-widest border border-amber-500/20 rounded-lg shrink-0">
                      {slot.time}
                    </span>
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid lg:grid-cols-2 gap-8 animate-fadeUp delay-100">
          <SectionShell
            title="Research Hub"
            icon={<Icons.Beaker />}
            right={
              <span className="text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-black uppercase tracking-widest">
                {researchProjects.length} projects
              </span>
            }
          >
            <div className="space-y-3">
              {researchProjects.map((project, index) => (
                <div key={index} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <p className="font-bold text-white text-sm leading-tight pr-4">{project.title}</p>
                    <span
                      className={cn(
                        "text-[9px] px-2 py-1 rounded border uppercase tracking-widest font-black shrink-0",
                        project.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">{project.role}</p>
                </div>
              ))}
            </div>
          </SectionShell>

          <SectionShell
            title="Faculty Summary"
            icon={<Icons.Sparkles />}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Operational Summary</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  You are managing <span className="font-bold text-white">{subjects.length}</span> subject{subjects.length !== 1 ? "s" : ""} across{" "}
                  <span className="font-bold text-white">{classes.length}</span> cohort{classes.length !== 1 ? "s" : ""}.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Attendance Radar</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Monitored average attendance is <span className="font-bold text-white">{averageAttendance}%</span>.
                  {lowCoverageClasses > 0 ? (
                    <span className="text-amber-400 font-bold"> {lowCoverageClasses} group(s) may need attention.</span>
                  ) : (
                    <span className="text-emerald-400 font-bold"> All tracked groups appear healthy.</span>
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Today’s Load</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  You have <span className="font-bold text-white">{lecturesToday}</span> lecture{lecturesToday !== 1 ? "s" : ""} scheduled for{" "}
                  <span className="font-bold text-white">{currentDay}</span>.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Guidance Load</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  You are currently assigned <span className="font-bold text-white">{advisingStudents}</span> mentee{advisingStudents !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          </SectionShell>
        </div>
      </div>

      {/* Premium animations */}
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
            @keyframes float-middle {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-15px) scale(1.03); }
            }
            @keyframes scan {
              0% { transform: translateY(-20px); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateY(20px); opacity: 0; }
            }
            @keyframes fadeUp {
              0% { opacity: 0; transform: translateY(16px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite 2s; }
            .animate-float-middle { animation: float-middle 9s ease-in-out infinite 1s; }
            .animate-fadeUp { animation: fadeUp .55s ease-out both; }
            .delay-100 { animation-delay: .1s; }
          `,
        }}
      />

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Edit Profile Details</h2>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-white transition-colors text-2xl"
                type="button"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put("/api/auth/me/teacher", {
                    advisingStudents,
                    researchProjects,
                    officeHours,
                  });
                  setIsEditingProfile(false);
                  loadDashboard({ silent: true });
                } catch (err) {
                  console.error("Profile update failed:", err);
                  alert("Failed to update profile");
                }
              }}
              className="space-y-6"
            >
              {/* Advising Students */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Advising Students</label>
                <input
                  type="number"
                  value={advisingStudents}
                  onChange={(e) => setAdvisingStudents(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                />
              </div>

              {/* Research Projects */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Research Projects</label>
                <div className="space-y-3">
                  {researchProjects.map((project, idx) => (
                    <div key={idx} className="flex gap-3 items-start border border-slate-700/30 p-4 rounded-xl bg-slate-800/30">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={project.title || ""}
                          onChange={(e) => {
                            const updated = [...researchProjects];
                            updated[idx].title = e.target.value;
                            setResearchProjects(updated);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                          required
                        />
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Role"
                            value={project.role || ""}
                            onChange={(e) => {
                              const updated = [...researchProjects];
                              updated[idx].role = e.target.value;
                              setResearchProjects(updated);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                          />
                          <select
                            value={project.status || ""}
                            onChange={(e) => {
                              const updated = [...researchProjects];
                              updated[idx].status = e.target.value;
                              setResearchProjects(updated);
                            }}
                            className="sm:w-40 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                          >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Published">Published</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResearchProjects(researchProjects.filter((_, i) => i !== idx))}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-bold transition-colors h-full flex items-center justify-center"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setResearchProjects([...researchProjects, { title: "", role: "", status: "Ongoing" }])}
                    className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border-dashed"
                  >
                    + Add Research Project
                  </button>
                </div>
              </div>

              {/* Office Hours */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Office Hours</label>
                <div className="space-y-3">
                  {officeHours.map((slot, idx) => (
                    <div key={idx} className="flex gap-3 items-start border border-slate-700/30 p-4 rounded-xl bg-slate-800/30">
                      <div className="flex-1 space-y-3">
                        <select
                          value={slot.day || ""}
                          onChange={(e) => {
                            const updated = [...officeHours];
                            updated[idx].day = e.target.value;
                            setOfficeHours(updated);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                        >
                          <option value="">Select Day...</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                        </select>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Time (e.g., 10:00 AM - 12:00 PM)"
                            value={slot.time || ""}
                            onChange={(e) => {
                              const updated = [...officeHours];
                              updated[idx].time = e.target.value;
                              setOfficeHours(updated);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Location"
                            value={slot.location || ""}
                            onChange={(e) => {
                              const updated = [...officeHours];
                              updated[idx].location = e.target.value;
                              setOfficeHours(updated);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600/50 text-white text-sm focus:border-cyan-500 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOfficeHours(officeHours.filter((_, i) => i !== idx))}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-bold transition-colors h-full flex items-center justify-center"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOfficeHours([...officeHours, { day: "", time: "", location: "" }])}
                    className="w-full py-2 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border-dashed"
                  >
                    + Add Office Hours
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
