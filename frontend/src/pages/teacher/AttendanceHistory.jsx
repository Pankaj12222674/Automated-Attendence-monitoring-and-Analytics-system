import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

const Icons = {
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Refresh: ({ spinning = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 1020 12" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V9H2v11h5m10 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m10 0H7" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.65 18h16.7a1 1 0 00.86-1.5l-7.5-13a1 1 0 00-1.72 0z" />
    </svg>
  ),
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function getStatusClasses(status) {
  const value = (status || "").toLowerCase();
  if (value === "present") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
  }
  if (value === "absent") {
    return "bg-rose-500/15 text-rose-300 border-rose-500/20";
  }
  if (value === "late") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/20";
  }
  return "bg-slate-500/15 text-slate-300 border-slate-500/20";
}

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const query = useQuery();

  const token = localStorage.getItem("token");
  const classId = query.get("classId");
  const subjectId = query.get("subjectId");
  const subjectName = query.get("subjectName") || "Subject";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");

  const totalSessions = history.length;

  const totalMarked = useMemo(() => {
    return history.reduce((sum, session) => {
      if (Array.isArray(session.students)) return sum + session.students.length;
      if (Array.isArray(session.records)) return sum + session.records.length;
      if (Array.isArray(session.attendance)) return sum + session.attendance.length;
      return sum;
    }, 0);
  }, [history]);

  const totalPresent = useMemo(() => {
    return history.reduce((sum, session) => {
      const records = session.students || session.records || session.attendance || [];
      return (
        sum +
        records.filter((r) => (r.status || "").toLowerCase() === "present").length
      );
    }, 0);
  }, [history]);

  const overallPercent = useMemo(() => {
    if (!totalMarked) return 0;
    return Math.round((totalPresent / totalMarked) * 100);
  }, [totalMarked, totalPresent]);

  const loadHistory = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (!classId || !subjectId) {
        setPageError("Missing class or subject details in the URL.");
        setLoading(false);
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      setPageError("");

      try {
        /**
         * Try these endpoints in order.
         * This makes the page more tolerant to backend naming differences.
         */
        const endpoints = [
          `/api/attendance/history?classId=${classId}&subjectId=${subjectId}`,
          `/api/attendance/subject-history?classId=${classId}&subjectId=${subjectId}`,
          `/api/teacher/attendance-history?classId=${classId}&subjectId=${subjectId}`,
        ];

        let loaded = false;
        let payload = [];

        for (const endpoint of endpoints) {
          try {
            // Using centralized api instance
            const res = await api.get(endpoint);
            payload =
              res.data?.history ||
              res.data?.records ||
              res.data?.attendance ||
              (Array.isArray(res.data) ? res.data : []);
            loaded = true;
            break;
          } catch (err) {
            // Silently fail and try the next endpoint
          }
        }

        if (!loaded) {
          throw new Error("No compatible attendance history endpoint responded.");
        }

        setHistory(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        setHistory([]);
        setPageError("Unable to load attendance history right now. Please check the backend route or try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, navigate, classId, subjectId]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-400 font-medium mt-6 tracking-widest uppercase text-sm animate-pulse">
          Loading Attendance Archive...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-float-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-float-delayed"></div>
      </div>

      {/* Top Bar */}
      <nav className="relative z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[90rem] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition backdrop-blur-sm inline-flex items-center gap-2"
            >
              <Icons.ArrowLeft />
              Back
            </button>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">
                Teacher / Attendance History
              </p>
              <h1 className="text-lg md:text-xl font-black text-white truncate">
                {subjectName}
              </h1>
            </div>
          </div>

          <button
            onClick={() => loadHistory({ silent: true })}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition backdrop-blur-sm inline-flex items-center gap-2"
          >
            <Icons.Refresh spinning={refreshing} />
            Refresh
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 pt-8">
        {pageError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
            <Icons.Alert />
            {pageError}
          </div>
        ) : null}

        {/* Hero */}
        <div className="relative mb-8 rounded-[2.25rem] p-8 md:p-10 overflow-hidden bg-gradient-to-br from-slate-900 to-[#12182b] border-t border-l border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.22em] mb-3">
                Attendance Archive
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {subjectName}
              </h2>
              <p className="text-slate-400 mt-3 text-sm">
                Review previous attendance sessions, marked records, and overall presence patterns.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto lg:min-w-[540px]">
              <div className="rounded-3xl p-5 bg-slate-950/45 border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">
                  Sessions
                </p>
                <p className="text-2xl font-black text-white">{totalSessions}</p>
              </div>

              <div className="rounded-3xl p-5 bg-slate-950/45 border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">
                  Marked Records
                </p>
                <p className="text-2xl font-black text-white">{totalMarked}</p>
              </div>

              <div className="rounded-3xl p-5 bg-slate-950/45 border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">
                  Presence Rate
                </p>
                <p className={`text-2xl font-black ${overallPercent >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                  {overallPercent}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History list */}
        {history.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 shadow-xl text-center">
            <p className="text-white text-lg font-bold mb-2">No attendance history found</p>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              There are no saved attendance sessions for this class and subject yet, or the backend endpoint is not returning history data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((session, index) => {
              const records = session.students || session.records || session.attendance || [];
              const presentCount = records.filter((r) => (r.status || "").toLowerCase() === "present").length;
              const absentCount = records.filter((r) => (r.status || "").toLowerCase() === "absent").length;
              const lateCount = records.filter((r) => (r.status || "").toLowerCase() === "late").length;
              const sessionPercent = records.length ? Math.round((presentCount / records.length) * 100) : 0;

              return (
                <div
                  key={session._id || `${session.date || "session"}-${index}`}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-400 mb-2">
                        Session {index + 1}
                      </p>
                      <h3 className="text-xl font-black text-white">
                        {formatDate(session.date || session.createdAt)}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Logged: {formatDateTime(session.createdAt || session.date)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-2xl bg-slate-950 border border-white/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Total</p>
                        <p className="text-lg font-black text-white mt-1">{records.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-white/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Present</p>
                        <p className="text-lg font-black text-emerald-400 mt-1">{presentCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-white/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Absent</p>
                        <p className="text-lg font-black text-rose-400 mt-1">{absentCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-white/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Rate</p>
                        <p className={`text-lg font-black mt-1 ${sessionPercent >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                          {sessionPercent}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Session Presence Pulse
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {sessionPercent}%
                      </p>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          sessionPercent >= 75
                            ? "bg-gradient-to-r from-emerald-600 to-teal-400"
                            : "bg-gradient-to-r from-amber-600 to-orange-400"
                        }`}
                        style={{ width: `${sessionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/5">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-950/80">
                          <tr className="text-left">
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              Student
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              Roll
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              Marked At
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {records.length > 0 ? (
                            records.map((record, ridx) => {
                              const studentName =
                                record.studentId?.name ||
                                record.student?.name ||
                                record.name ||
                                "Unknown Student";

                              const roll =
                                record.studentId?.roll ||
                                record.student?.roll ||
                                record.roll ||
                                "—";

                              const status = record.status || "unknown";

                              return (
                                <tr
                                  key={record._id || `${studentName}-${ridx}`}
                                  className="border-t border-white/5 bg-slate-900/30"
                                >
                                  <td className="px-4 py-3 text-white font-medium">
                                    {studentName}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {roll}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusClasses(status)}`}
                                    >
                                      {(status || "").toLowerCase() === "present" ? <Icons.Check /> : <Icons.X />}
                                      {status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    {formatDateTime(record.markedAt || record.updatedAt || record.createdAt)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                No student records available for this session.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Icons.Calendar />
                      {formatDate(session.date || session.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Icons.Users />
                      {records.length} student record{records.length !== 1 ? "s" : ""}
                    </span>
                    {lateCount > 0 ? (
                      <span className="inline-flex items-center gap-2 text-amber-400">
                        {lateCount} late mark{lateCount !== 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
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
            .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite 2s; }
          `,
        }}
      />
    </div>
  );
}