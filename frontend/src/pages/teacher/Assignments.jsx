import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Document: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ExternalLink: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

export default function TeacherAssignments() {
  const query = useQuery();
  const navigate = useNavigate();

  // Cohort & Subject Context
  const classId = query.get("classId");
  const subjectId = query.get("subjectId");
  const subjectName = query.get("subjectName") || "University Course";

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [isPublishing, setIsPublishing] = useState(false);

  // Grading Modal States
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Track grades being typed before submission
  const [gradingData, setGradingData] = useState({});

  /* ===============================
        LOAD ASSIGNMENTS
  =============================== */
  useEffect(() => {
    if (!classId || !subjectId) return;

    const fetchAssignments = async () => {
      try {
        // Headers handled automatically by api interceptor
        const res = await api.get(`/api/assignments/class/${classId}`);
        
        // Filter to only show assignments for this specific subject
        const courseAssignments = (res.data.assignments || []).filter(
          a => a.subjectId?._id === subjectId || a.subjectId === subjectId
        );
        
        setAssignments(courseAssignments);
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [classId, subjectId]);

  /* ===============================
        PUBLISH NEW ASSIGNMENT
  =============================== */
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      // Headers handled automatically by api interceptor
      const res = await api.post("/api/assignments/create", { 
        title, 
        description, 
        classId, 
        subjectId, 
        dueDate, 
        totalMarks 
      });

      // Add to UI immediately
      setAssignments([...assignments, res.data.assignment]);
      
      // Reset Form
      setTitle("");
      setDescription("");
      setDueDate("");
      setTotalMarks(100);
      alert("Assignment published to student portals successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish assignment");
    } finally {
      setIsPublishing(false);
    }
  };

  /* ===============================
        OPEN GRADING PORTAL
  =============================== */
  const openGradingPortal = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);

    try {
      // Headers handled automatically by api interceptor
      const res = await api.get(`/api/assignments/submissions/${assignment._id}`);
      
      const subs = res.data.submissions || [];
      setSubmissions(subs);

      // Pre-fill gradingData state with any existing grades
      const initialGrades = {};
      subs.forEach(sub => {
        initialGrades[sub._id] = {
          marksObtained: sub.marksObtained !== null ? sub.marksObtained : "",
          feedback: sub.feedback || ""
        };
      });
      setGradingData(initialGrades);
    } catch (err) {
      alert("Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ===============================
        SUBMIT GRADE
  =============================== */
  const handleGradeSubmit = async (submissionId) => {
    const data = gradingData[submissionId];
    if (data.marksObtained === "") return alert("Please enter marks.");
    
    if (Number(data.marksObtained) > selectedAssignment.totalMarks) {
      return alert(`Marks cannot exceed the total limit of ${selectedAssignment.totalMarks}.`);
    }

    try {
      // Headers handled automatically by api interceptor
      const res = await api.put(`/api/assignments/grade/${submissionId}`, { 
        marksObtained: Number(data.marksObtained), 
        feedback: data.feedback 
      });

      // Update the local submission state so the UI reflects "graded"
      setSubmissions(submissions.map(sub => 
        sub._id === submissionId ? res.data.submission : sub
      ));
      
      alert("Grade synchronized to university database.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save grade.");
    }
  };

  if (!classId || !subjectId) {
    return <div className="min-h-screen bg-slate-950 overflow-hidden relative text-white flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />Error: Missing Course Context. Please access this portal via the Dashboard.</div>;
  }

  return (
    <div className="overflow-hidden relative min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-cyan-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
      
      {/* HEADER NAV */}
      <div className="bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 sticky top-0 z-40 shadow-xl">
        <div className="max-w-[90rem] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/teacher/dashboard" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2 mb-1">
              <Icons.ArrowLeft /> Back to Portal
            </Link>
            <h1 className="text-xl font-bold text-white leading-tight">LMS Management</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-400 hidden sm:block">{subjectName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 pt-8 grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: CREATE ASSIGNMENT FORM (Takes up 4/12 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-6 shadow-xl sticky top-28">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <div className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-lg"><Icons.Plus /></div>
              Publish Coursework
            </h2>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Assignment Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-3.5 rounded-xl focus:border-cyan-500 outline-none transition"
                  placeholder="e.g. Midterm Essay Draft"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Prompt / Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="4"
                  className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-3.5 rounded-xl focus:border-cyan-500 outline-none transition resize-none"
                  placeholder="Provide instructions or attach links here..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Due Date & Time</label>
                  <input type="datetime-local" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-3.5 rounded-xl focus:border-cyan-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Total Marks</label>
                  <input type="number" required min="1" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-3.5 rounded-xl focus:border-cyan-500 outline-none transition"
                  />
                </div>
              </div>

              <button type="submit" disabled={isPublishing} className="w-full mt-4 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] font-bold transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50">
                {isPublishing ? "Distributing to Cohort..." : "Publish to LMS"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: ACTIVE ASSIGNMENTS LIST (Takes up 8/12 cols) */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Document /> Active Assignments
            </h2>
            <span className="text-sm font-medium text-slate-400">{assignments.length} Total</span>
          </div>

          {loading ? (
             <div className="flex justify-center p-10"><div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div></div>
          ) : assignments.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-10 text-center shadow-lg">
              <p className="text-slate-500">You haven't published any coursework for this class yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {assignments.map(task => {
                const isPastDue = new Date() > new Date(task.dueDate);
                return (
                  <div key={task._id} className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-6 shadow-lg hover:border-cyan-500/30 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${isPastDue ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {isPastDue ? "Closed" : "Accepting Submissions"}
                        </div>
                        <span className="text-xs font-bold text-slate-500">{task.totalMarks} Points</span>
                      </div>
                      <h3 className="font-bold text-white text-lg leading-tight mb-2">{task.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{task.description}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-4">
                        Deadline: <span className="text-white">{new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </p>
                      <button 
                        onClick={() => openGradingPortal(task)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                      >
                        <Icons.Users /> Open Grading Portal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* GRADING PORTAL MODAL / HUD                                */}
      {/* ========================================================= */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl w-full max-w-5xl h-full max-h-[90vh] shadow-2xl flex flex-col animate-fadeUp overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Grading Portal</span>
                <h2 className="text-2xl font-black text-white mt-1">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Submissions List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingSubmissions ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div></div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-medium">No students have submitted this assignment yet.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => {
                    const isGraded = sub.status === "graded";
                    const isLate = sub.status === "late";
                    
                    return (
                      <div key={sub._id} className={`p-5 rounded-2xl border transition-colors ${isGraded ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-slate-950 border-slate-800'}`}>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          {/* Student Info */}
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold uppercase">
                              {sub.studentId?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-base">{sub.studentId?.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 font-mono">{sub.studentId?.roll}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isLate ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                  {sub.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* File Link */}
                          <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold transition w-max">
                            View Submission <Icons.ExternalLink />
                          </a>
                        </div>

                        {/* Grading Inputs */}
                        <div className="flex flex-col sm:flex-row items-end gap-3 pt-4 border-t border-slate-800/50">
                          <div className="w-full sm:w-24">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Score / {selectedAssignment.totalMarks}</label>
                            <input 
                              type="number" 
                              min="0"
                              max={selectedAssignment.totalMarks}
                              value={gradingData[sub._id]?.marksObtained || ""}
                              onChange={(e) => setGradingData({...gradingData, [sub._id]: { ...gradingData[sub._id], marksObtained: e.target.value }})}
                              className={`w-full bg-slate-900 border p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 text-sm font-bold ${isGraded ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-700 text-white'}`}
                            />
                          </div>
                          <div className="w-full flex-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Professor Feedback (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="Great analysis on point 3..."
                              value={gradingData[sub._id]?.feedback || ""}
                              onChange={(e) => setGradingData({...gradingData, [sub._id]: { ...gradingData[sub._id], feedback: e.target.value }})}
                              className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                            />
                          </div>
                          <button 
                            onClick={() => handleGradeSubmit(sub._id)}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${isGraded ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700' : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-900/20'}`}
                          >
                            {isGraded ? <><Icons.Check /> Update</> : "Save Grade"}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}