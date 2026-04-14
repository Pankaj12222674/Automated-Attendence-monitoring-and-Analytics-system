import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Document: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

export default function Assignments() {
  const token = localStorage.getItem("token");
  
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedTask, setSelectedTask] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLMSData = async () => {
      try {
        // 1. Get User Profile for classId
        const userRes = await api.get("/api/auth/me");
        const userData = userRes.data.user || userRes.data;
        setProfile(userData);

        const classId = userData.classId?._id || userData.classId;

        if (classId) {
          // 2. Fetch all assignments for this cohort
          const assignRes = await api.get(`/api/assignments/class/${classId}`);
          setAssignments(assignRes.data.assignments || []);

          // 3. Fetch student's specific submissions (to check what is done vs pending)
          const subRes = await api.get("/api/assignments/my-submissions");
          setSubmissions(subRes.data.submissions || []);
        }
      } catch (err) {
        console.error("LMS Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLMSData();
  }, [token]);

  // Combine datasets to figure out the status of each assignment
  const tasks = assignments.map(assignment => {
    const submission = submissions.find(sub => sub.assignmentId._id === assignment._id || sub.assignmentId === assignment._id);
    const isPastDue = new Date() > new Date(assignment.dueDate);
    
    let uiStatus = "pending";
    if (submission) {
      uiStatus = submission.status; // "submitted", "late", or "graded"
    } else if (isPastDue) {
      uiStatus = "missing";
    }

    return { ...assignment, submission, uiStatus };
  });

  const pendingTasks = tasks.filter(t => t.uiStatus === "pending" || t.uiStatus === "missing");
  const completedTasks = tasks.filter(t => ["submitted", "late", "graded"].includes(t.uiStatus));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileUrl) return alert("Please provide a link to your assignment file.");
    setIsSubmitting(true);

    try {
      const res = await api.post("/api/assignments/submit", { 
        assignmentId: selectedTask._id, 
        fileUrl 
      });
      
      // Update local state without reloading
      setSubmissions([...submissions, res.data.submission]);
      setSelectedTask(null);
      setFileUrl("");
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending": return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Icons.Clock /> Pending</span>;
      case "missing": return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Icons.Alert /> Missing</span>;
      case "submitted": return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Icons.CheckCircle /> Submitted</span>;
      case "late": return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Icons.CheckCircle /> Submitted Late</span>;
      case "graded": return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Icons.CheckCircle /> Graded</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans">
      
      {/* HEADER NAV */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/student/dashboard" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2">
            <Icons.ArrowLeft /> Return to Dashboard
          </Link>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-400">LMS Canvas</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Assignment Dropox</h1>
          <p className="text-slate-400">Upload your coursework, track deadlines, and review professor feedback.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: ACTION REQUIRED */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Action Required
            </h2>
            
            {pendingTasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-lg">
                <Icons.CheckCircle />
                <p className="text-slate-400 mt-4">You are all caught up! No pending assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-indigo-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{task.subjectId?.name}</p>
                        <h3 className="font-bold text-white text-lg leading-tight">{task.title}</h3>
                      </div>
                      {getStatusBadge(task.uiStatus)}
                    </div>
                    
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{task.description}</p>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                      <div className="text-xs font-bold text-slate-500">
                        Due: <span className={task.uiStatus === "missing" ? "text-rose-400" : "text-white"}>{new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                      >
                        <Icons.Upload /> Submit Work
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: COMPLETED */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed & Graded
            </h2>

            {completedTasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-lg">
                <p className="text-slate-500">Your submitted assignments will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.map(task => (
                  <div key={task._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{task.subjectId?.name}</p>
                        <h3 className="font-bold text-white text-lg leading-tight">{task.title}</h3>
                      </div>
                      {getStatusBadge(task.uiStatus)}
                    </div>

                    {/* Grading Details */}
                    {task.uiStatus === "graded" && task.submission ? (
                      <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Professor Feedback</p>
                          <p className="text-2xl font-black text-emerald-400">{task.submission.marksObtained}<span className="text-sm text-emerald-500/50">/{task.totalMarks}</span></p>
                        </div>
                        <p className="text-sm text-slate-300 italic">"{task.submission.feedback || "No written feedback provided."}"</p>
                      </div>
                    ) : (
                      <div className="mt-4 bg-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Professor Grade</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* UPLOAD MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fadeUp">
            
            <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <Icons.Document />
            </div>

            <h2 className="text-xl font-bold text-white mb-1">Submit Assignment</h2>
            <p className="text-sm text-slate-400 mb-6">{selectedTask.title}</p>

            <form onSubmit={handleUpload}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Google Drive / File URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl focus:border-indigo-500 outline-none transition"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 mt-2">Ensure your document sharing settings are set to "Anyone with the link can view".</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Uploading..." : "Confirm Submission"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}