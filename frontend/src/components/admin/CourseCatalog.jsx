import React, { useState, useEffect } from "react";
import api from "../../api";

function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeProgramId, setActiveProgramId] = useState("");

  const [formData, setFormData] = useState({
    courseCode: "",
    name: "",
    description: "",
    credits: 3,
    programId: "",
    semester: 1,
    isElective: false,
  });

  useEffect(() => {
    fetchUniversityData();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (activeProgramId) {
      fetchCourses(activeProgramId);
    } else {
      fetchCourses();
    }
  }, [activeProgramId]);

  const fetchUniversityData = async () => {
    try {
      const res = await api.get("/api/university/all");
      if (res.data?.programs) {
        setPrograms(res.data.programs);
      }
    } catch (err) {
      console.error("Failed to fetch university structure:", err);
    }
  };

  const fetchCourses = async (progId = "") => {
    try {
      setLoading(true);
      const url = progId ? `/api/university/courses?programId=${progId}` : "/api/university/courses";
      const res = await api.get(url);
      if (res.data?.courses) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.programId) {
        return alert("Please select a Program");
      }
      await api.post("/api/university/create-course", formData);
      alert("Master Course created successfully!");
      setFormData({
        courseCode: "",
        name: "",
        description: "",
        credits: 3,
        programId: formData.programId, // keep selected program
        semester: formData.semester,   // keep selected semester
        isElective: false,
      });
      fetchCourses(activeProgramId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create master course.");
    }
  };

  // Shared Styles to match Admin theme
  const cardClasses = "bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5";
  const inputClasses = "w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm";
  const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Create Master Course Form */}
      <div className={`lg:col-span-1 ${cardClasses}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/20 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">New Master Course</h3>
            <p className="text-xs text-slate-400">Add course to university catalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Program / Degree</label>
              <select name="programId" value={formData.programId} onChange={handleChange} className={inputClasses} required>
                <option value="">Select Program...</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Semester</label>
              <input type="number" name="semester" min="1" max="10" value={formData.semester} onChange={handleChange} className={inputClasses} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Course Code</label>
              <input type="text" name="courseCode" value={formData.courseCode} onChange={handleChange} placeholder="e.g. CS101" className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Credits</label>
              <input type="number" name="credits" min="0" max="10" step="0.5" value={formData.credits} onChange={handleChange} className={inputClasses} required />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Course Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Intro to Computer Science" className={inputClasses} required />
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Course overview..." rows={2} className={inputClasses}></textarea>
          </div>

          <label className="flex items-center cursor-pointer gap-2 py-2">
            <input type="checkbox" name="isElective" checked={formData.isElective} onChange={handleChange} className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-700 rounded focus:ring-cyan-500/50" />
            <span className="text-sm text-slate-300">Is this an Elective/Optional course?</span>
          </label>

          <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all">
            Add to Catalog
          </button>
        </form>
      </div>

      {/* Course List Dashboard */}
      <div className={`lg:col-span-2 ${cardClasses} flex flex-col`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Course Catalog Viewer</h3>
            <p className="text-xs text-slate-400">View all assigned master courses.</p>
          </div>

          <select
            value={activeProgramId}
            onChange={(e) => setActiveProgramId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none w-full sm:w-auto"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-cyan-500 animate-pulse">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500">No master courses found.</p>
              <p className="text-xs text-slate-600 mt-1">Add courses by selecting a Program and Semester.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 px-2 font-medium tracking-wider uppercase text-[10px]">Course</th>
                    <th className="pb-3 px-2 font-medium tracking-wider uppercase text-[10px]">Program</th>
                    <th className="pb-3 px-2 font-medium tracking-wider uppercase text-[10px]">Sem</th>
                    <th className="pb-3 px-2 font-medium tracking-wider uppercase text-[10px]">Credits</th>
                    <th className="pb-3 px-2 font-medium tracking-wider uppercase text-[10px]">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {courses.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-semibold text-slate-200">{c.courseCode}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{c.name}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700">
                          {c.programId?.name || "Global"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-mono">S{c.semester}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-cyan-500" />
                          <span className="font-bold text-white">{c.credits}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {c.isElective ? (
                          <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded text-[11px] border border-amber-500/20">Elective</span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded text-[11px] border border-emerald-500/20">Core</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCatalog;
