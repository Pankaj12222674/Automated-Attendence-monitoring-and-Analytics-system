import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export default function ClassStudents() {
  const query = useQuery();
  const navigate = useNavigate();

  const classId = query.get("classId");
  const className = query.get("name");

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentAnalytics, setStudentAnalytics] = useState({}); // { studentId: { percentage } }
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!classId || !token) {
      navigate("/teacher/dashboard");
      return;
    }

    const loadClassData = async () => {
      try {
        // 1. Get Students in Class (Headers automatically handled by interceptor)
        const studentsRes = await api.get(`/api/class/students/${classId}`);
        const studentList = studentsRes.data.students || [];
        setStudents(studentList);
        setFilteredStudents(studentList);

        // 2. NEW: Get Attendance % for each student in this class
        const analyticsRes = await api.get(`/api/attendance/class-analytics/${classId}`);
        setStudentAnalytics(analyticsRes.data || {});

      } catch (err) {
        console.error("Error loading class data:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [classId, token, navigate]);

  // Search Filter
  useEffect(() => {
    const filtered = students.filter((student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll?.toString().includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const getAttendanceColor = (percent) => {
    if (percent >= 85) return "bg-emerald-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getStatusText = (percent) => {
    if (percent >= 85) return "Excellent";
    if (percent >= 75) return "Good";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex overflow-hidden relative items-center justify-center text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading students and attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden relative min-h-screen bg-slate-950 text-slate-200 pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
      {/* Sticky Header */}
      <div className="sticky top-0 bg-slate-900/70 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="text-slate-400 hover:text-white flex items-center gap-2 transition"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{className || "Class"}</h1>
              <p className="text-sm text-slate-400">Student List & Attendance Overview</p>
            </div>
          </div>
          <div className="text-emerald-400 font-medium">
            {filteredStudents.length} Students
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 border border-white/10 pl-12 py-4 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Students Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 flex justify-between items-center">
            <h2 className="font-semibold text-xl">Class Students</h2>
            <span className="text-xs uppercase tracking-widest text-slate-400">Attendance Percentage</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5 text-left">Roll No.</th>
                  <th className="px-8 py-5 text-left">Student Name</th>
                  <th className="px-8 py-5 text-left">Email</th>
                  <th className="px-8 py-5 text-center">Attendance %</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-500">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const percent = studentAnalytics[student._id]?.percentage || 0;

                    return (
                      <tr key={student._id} className="hover:bg-cyan-500/10 transition-colors group">
                        <td className="px-8 py-6 font-mono text-slate-300">{student.roll || "—"}</td>
                        <td className="px-8 py-6 font-medium text-white flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-700 rounded-2xl flex items-center justify-center">
                            <Icons.User />
                          </div>
                          {student.name}
                        </td>
                        <td className="px-8 py-6 text-slate-400 text-sm">{student.email}</td>
                        <td className="px-8 py-6 text-center">
                          <div className={`inline-flex items-center justify-center w-16 h-9 rounded-2xl text-sm font-bold ${getAttendanceColor(percent)}`}>
                            {percent}%
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-4 py-1 text-xs font-medium rounded-full ${
                            percent >= 75 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {getStatusText(percent)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => navigate(`/student/details?subject=All&studentId=${student._id}`)}
                            className="text-blue-400 hover:text-blue-500 text-sm font-medium transition"
                          >
                            View History →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Attendance Summary */}
        {filteredStudents.some(s => {
          const p = studentAnalytics[s._id]?.percentage || 0;
          return p < 75;
        }) && (
          <div className="mt-8 p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm">
            ⚠️ Some students have low attendance. Consider sending reminders.
          </div>
        )}
      </div>
    </div>
  );
}