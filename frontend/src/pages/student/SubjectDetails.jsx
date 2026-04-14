import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Icons = {
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
  Qr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  ),
  Face: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Hand: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
      />
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
};

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMethodBadge(method) {
  const m = (method || "").toLowerCase();

  if (m === "qr") {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold">
        <Icons.Qr /> QR Scan
      </span>
    );
  }

  if (m === "face") {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs font-bold">
        <Icons.Face /> Biometric
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-lg text-xs font-bold">
      <Icons.Hand /> Manual
    </span>
  );
}

function getStatusPill(status, isExcused) {
  if (isExcused) {
    return (
      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">
        Excused
      </span>
    );
  }

  if (status === "present") {
    return (
      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">
        Present
      </span>
    );
  }

  if (status === "late") {
    return (
      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">
        Late
      </span>
    );
  }

  return (
    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">
      Absent
    </span>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-900 border-slate-800 text-white text-slate-500",
    emerald: "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 text-emerald-500/70",
    amber: "bg-amber-500/5 border-amber-500/10 text-amber-400 text-amber-500/70",
    indigo: "bg-indigo-500/5 border-indigo-500/10 text-indigo-400 text-indigo-500/70",
    rose: "bg-rose-500/5 border-rose-500/10 text-rose-400 text-rose-500/70",
  };

  const active = toneMap[tone] || toneMap.slate;
  const parts = active.split(" ");

  return (
    <div className={`${parts[0]} ${parts[1]} p-6 rounded-2xl flex flex-col justify-center shadow-lg border`}>
      <p className={`text-xs ${parts[3]} font-bold uppercase tracking-wider mb-1`}>{label}</p>
      <p className={`text-3xl font-black ${parts[2]}`}>{value}</p>
    </div>
  );
}

export default function SubjectDetails() {
  const query = useQuery();
  const subjectNameFromUrl = query.get("subject") || "";
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [studentId, setStudentId] = useState(localStorage.getItem("id") || "");
  const [records, setRecords] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (!subjectNameFromUrl) {
        setError("Missing subject information in the URL.");
        setLoading(false);
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        let resolvedStudentId = studentId;

        // fallback if localStorage.id is missing
        if (!resolvedStudentId) {
          // Headers handled automatically by api interceptor
          const userRes = await api.get("/api/auth/me");
          const user = userRes.data.user || userRes.data;
          resolvedStudentId = user?._id || user?.id || "";
          if (resolvedStudentId) {
            setStudentId(resolvedStudentId);
          }
        }

        if (!resolvedStudentId) {
          throw new Error("Student Authentication Error");
        }

        // Headers handled automatically by api interceptor
        const res = await api.get(`/api/student/attendance/history/${resolvedStudentId}`);

        const allRecords = Array.isArray(res.data) ? res.data : [];

        const filtered = allRecords.filter((rec) => {
          const recSubject = rec.subjectId?.name || "";
          const urlSubject = subjectNameFromUrl || "";
          return recSubject.toLowerCase().trim() === urlSubject.toLowerCase().trim();
        });

        setRecords(filtered);

        if (filtered.length > 0) {
          setCourseInfo({
            code: filtered[0].subjectId?.code || "CRS-000",
            credits: filtered[0].subjectId?.credits || 3,
            type: filtered[0].subjectId?.courseType || "core",
            professor: filtered[0].teacherId?.name || "Faculty TBA",
            designation: filtered[0].teacherId?.designation || "Instructor",
          });
        } else {
          setCourseInfo({
            code: "CRS-TBA",
            credits: 3,
            type: "core",
            professor: "Faculty TBA",
            designation: "Instructor",
          });
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        setError("Failed to synchronize with university databases.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate, studentId, subjectNameFromUrl, token]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalSessions = records.length;

  const excusedCount = useMemo(
    () => records.filter((r) => r.isExcused).length,
    [records]
  );

  const lateCount = useMemo(
    () => records.filter((r) => r.status === "late" && !r.isExcused).length,
    [records]
  );

  const absentCount = useMemo(
    () => records.filter((r) => r.status === "absent" && !r.isExcused).length,
    [records]
  );

  const presentCount = useMemo(
    () => records.filter((r) => r.status === "present" && !r.isExcused).length,
    [records]
  );

  const validSessions = totalSessions - excusedCount;
  const attendedSessions = presentCount + lateCount;
  const percent = validSessions > 0 ? Math.round((attendedSessions / validSessions) * 100) : 0;

  const chartData = useMemo(() => {
    return [...records].reverse().map((rec) => {
      let value = 0;

      if (rec.isExcused) value = 100;
      else if (rec.status === "present") value = 100;
      else if (rec.status === "late") value = 50;
      else value = 0;

      return {
        date: formatDate(rec.date),
        value,
        status: rec.isExcused ? "Excused" : rec.status,
        session: rec.sessionType || "lecture",
      };
    });
  }, [records]);

  const standingTone = percent >= 75 ? "text-emerald-400" : "text-rose-500";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-indigo-400 mt-4 font-medium text-sm tracking-widest uppercase">
          Fetching Course Audit...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-center px-6">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-rose-300 max-w-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icons.Alert />
            <span className="font-bold">Unable to load subject details</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>

        <Link to="/student/dashboard" className="mt-5 text-sm text-indigo-400 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30">
      {/* HEADER NAV */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2"
          >
            <Icons.ArrowLeft />
            Return to Central Portal
          </button>

          <button
            onClick={() => loadData({ silent: true })}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition backdrop-blur-sm inline-flex items-center gap-2"
          >
            <Icons.Refresh spinning={refreshing} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* HERO COURSE INFO */}
        <div className="bg-gradient-to-r from-slate-900 to-[#12182b] border border-white/5 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">
                  {courseInfo?.code || "CRS-TBA"}
                </span>
                <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                  {courseInfo?.credits || 3} Credits
                </span>
                <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                  {(courseInfo?.type || "core").toString()}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 break-words">
                {subjectNameFromUrl}
              </h1>

              <p className="text-slate-400 font-medium text-lg flex items-center gap-2 flex-wrap">
                <Icons.Book />
                {courseInfo?.designation} {courseInfo?.professor}
              </p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 backdrop-blur-sm rounded-2xl p-5 flex flex-col items-center min-w-[160px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                Attendance Standing
              </p>
              <p className={`text-5xl font-black ${standingTone}`}>{percent}%</p>
            </div>
          </div>
        </div>

        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Sessions" value={totalSessions} tone="slate" />
          <StatCard label="Present" value={presentCount} tone="emerald" />
          <StatCard label="Late" value={lateCount} tone="amber" />
          <StatCard label="Excused" value={excusedCount} tone="indigo" />
          <StatCard label="Absent" value={absentCount} tone="rose" />
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
          <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 gap-4 flex-wrap">
            <span>Minimum Requirement: 75%</span>
            <span>Current: {percent}%</span>
          </div>

          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div className="absolute top-0 bottom-0 left-[75%] w-1 bg-white/20 z-10"></div>
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                percent >= 85 ? "bg-emerald-500" : percent >= 75 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {percent < 75 ? (
            <p className="text-xs text-rose-400 font-medium mt-3 flex items-center gap-1.5">
              ⚠ Warning: You are below the university required threshold for this course.
            </p>
          ) : (
            <p className="text-xs text-emerald-400 font-medium mt-3">
              You are currently meeting the university threshold for this course.
            </p>
          )}
        </div>

        {/* INTERACTIVE CHART */}
        <div className="mb-10 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
            <h2 className="text-lg font-bold text-white">Chronological Attendance Log</h2>
            <span className="text-xs font-bold bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              {records.length} records
            </span>
          </div>

          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="date"
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
                  labelStyle={{ color: "#818cf8", fontWeight: "bold" }}
                  formatter={(value, name, props) => [String(props?.payload?.status || "").toUpperCase(), "Status"]}
                />
                <Area
                  type="step"
                  dataKey="value"
                  stroke="#818cf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStatus)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center">
              <p className="font-semibold text-white mb-2">No logs available to chart</p>
              <p className="text-sm">Attendance records for this subject have not appeared yet.</p>
            </div>
          )}
        </div>

        {/* DETAILED RECORDS TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-white">Detailed Session Audit</h2>
            <span className="text-xs font-bold bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              {records.length} Total Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session Type</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Validation Method</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded By</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/50">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500 font-medium">
                      No session logs found for this course.
                    </td>
                  </tr>
                ) : (
                  records.map((rec, i) => (
                    <tr key={rec._id || i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium text-slate-300">
                        {formatFullDate(rec.date)}
                      </td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-black tracking-widest text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                          {rec.sessionType || "Lecture"}
                        </span>
                      </td>
                      <td className="p-4">{getStatusPill(rec.status, rec.isExcused)}</td>
                      <td className="p-4">{getMethodBadge(rec.method)}</td>
                      <td className="p-4 text-sm text-slate-400">
                        {rec.recordedBy?.name || rec.teacherId?.name || "Automated System"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}