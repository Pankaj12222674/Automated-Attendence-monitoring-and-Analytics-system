import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const formatDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

const Icons = {
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
};

export default function ManualAttendance() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const query = useQuery();

  const classId = query.get("classId");
  const subjectId = query.get("subjectId");
  const subjectName = query.get("subjectName") || "Course";

  const [students, setStudents] = useState([]);
  
  // UPGRADED STATE: Tracks status (present/absent/late), isExcused, and notes
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(formatDate(new Date()));
  const [sessionType, setSessionType] = useState("lecture"); // Lecture, Lab, Seminar
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ===============================
        LOAD STUDENTS
  =============================== */
  useEffect(() => {
    if (!classId) return;

    const loadStudents = async () => {
      try {
        const res = await API.get(`/api/class/students/${classId}`,
           //API.get(`/api/class/students/${classId}`)
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const list = res.data.students || [];
        setStudents(list);

        // Initialize advanced attendance state
        const initialData = {};
        list.forEach((s) => {
          initialData[s._id] = {
            status: "present", // Default to present
            isExcused: false,
            notes: ""
          };
        });
        setAttendanceData(initialData);

      } catch (err) {
        console.error(err);
        alert("Failed to load class students.");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classId, token]);

  /* ===============================
        UPDATE ATTENDANCE STATUS
  =============================== */
  const updateStatus = (id, newStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: newStatus }
    }));
  };

  const toggleExcused = (id) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        isExcused: !prev[id].isExcused,
        // If they are excused, force their status to absent so they aren't counted as present,
        // but the backend will ignore this absence for penalty math.
        status: !prev[id].isExcused ? "absent" : "present" 
      }
    }));
  };

  const markAll = (targetStatus) => {
    const newData = {};
    students.forEach((s) => {
      newData[s._id] = { ...attendanceData[s._id], status: targetStatus, isExcused: false };
    });
    setAttendanceData(newData);
  };

  /* ===============================
        SUBMIT ATTENDANCE
  =============================== */
  const submitAttendance = async () => {
    if (!window.confirm(`Submit ${sessionType} attendance for ${date}?`)) return;
    setSaving(true);

    const records = students.map((s) => ({
      studentId: s._id,
      status: attendanceData[s._id].status,
      isExcused: attendanceData[s._id].isExcused,
      notes: attendanceData[s._id].notes
    }));

    try {
      await API.post("/api/attendance/mark", {
        
          classId,
          subjectId,
          date,
          sessionType, // Sending the university session type
          method: "manual",
          records
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Attendance saved successfully to university records.");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
        CALCULATE SUMMARIES
  =============================== */
  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  Object.values(attendanceData).forEach(data => {
    if (data.isExcused) counts.excused++;
    else counts[data.status]++;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-32">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 mb-1 flex items-center gap-1">
              ← Back to Portal
            </button>
            <h1 className="text-xl font-bold text-white leading-tight">Record Attendance</h1>
            <p className="text-sm text-slate-400">{subjectName}</p>
          </div>
          <button 
            onClick={submitAttendance}
            disabled={saving}
            className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-70"
          >
            <Icons.Save /> {saving ? "Saving..." : "Save Register"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8">

        {/* CONTROLS (Date & Session Type) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Date</label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Session Type</label>
            <select
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="lecture">Lecture</option>
              <option value="lab">Laboratory</option>
              <option value="tutorial">Tutorial</option>
              <option value="seminar">Seminar</option>
              <option value="exam">Examination</option>
            </select>
          </div>
        </div>

        {/* SUMMARY DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-emerald-500">{counts.present}</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1">Present</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-amber-500">{counts.late}</span>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">Late</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-rose-500">{counts.absent}</span>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-1">Absent</span>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-indigo-400">{counts.excused}</span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mt-1">Excused</span>
          </div>
          
          {/* Quick Action Overrides */}
          <div className="col-span-2 md:col-span-1 flex md:flex-col gap-2">
            <button onClick={() => markAll("present")} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition">
              All Present
            </button>
            <button onClick={() => markAll("absent")} className="flex-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition">
              All Absent
            </button>
          </div>
        </div>

        {/* STUDENT LIST */}
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
              No students are registered in this cohort.
            </div>
          )}

          {students.map((s, index) => {
            const data = attendanceData[s._id];
            
            return (
              <div 
                key={s._id} 
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border transition-colors ${
                  data.isExcused ? 'bg-indigo-900/20 border-indigo-500/30' :
                  data.status === 'present' ? 'bg-slate-900 border-slate-800' :
                  data.status === 'late' ? 'bg-amber-900/10 border-amber-500/20' :
                  'bg-rose-900/10 border-rose-500/20'
                }`}
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{s.roll || "Pending ID"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Core Status Buttons */}
                  <div className={`flex bg-slate-950 p-1 rounded-xl border transition-colors ${data.isExcused ? 'opacity-50 pointer-events-none border-slate-800' : 'border-slate-800'}`}>
                    <button
                      onClick={() => updateStatus(s._id, "present")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${data.status === "present" ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <Icons.Check /> P
                    </button>
                    <button
                      onClick={() => updateStatus(s._id, "late")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${data.status === "late" ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <Icons.Clock /> L
                    </button>
                    <button
                      onClick={() => updateStatus(s._id, "absent")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${data.status === "absent" ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <Icons.X /> A
                    </button>
                  </div>

                  {/* University Excused Toggle */}
                  <button
                    onClick={() => toggleExcused(s._id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      data.isExcused 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:bg-slate-900'
                    }`}
                    title="Mark as University Excused Absence (e.g. Medical)"
                  >
                    <Icons.Shield /> Excused
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* STICKY MOBILE FOOTER */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 z-50">
        <button 
          onClick={submitAttendance}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-70"
        >
          <Icons.Save /> {saving ? "Saving Records..." : "Save Register"}
        </button>
      </div>

    </div>
  );
}