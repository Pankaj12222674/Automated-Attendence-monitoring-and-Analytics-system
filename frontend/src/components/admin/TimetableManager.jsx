import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";

const inputClasses = "w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-2.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm placeholder-slate-500 transition-all";
const btnClasses = "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2";

const SectionCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 p-5 hover:border-cyan-500/30 transition-colors duration-500 ${className}`}>
    <div className="mb-4">
      <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
      {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function TimetableManager({ classes, subjects, teachers }) {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // Auto-Generate State
  const [autoGenClass, setAutoGenClass] = useState("");
  const [autoGenSubjects, setAutoGenSubjects] = useState([{ subjectId: "", teacherId: "", frequency: 1 }]);
  const [autoGenDays, setAutoGenDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  
  // Default common time slots
  const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];
  const [autoGenSlots, setAutoGenSlots] = useState([...DEFAULT_SLOTS]);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterClass ? `/api/timetable?classId=${filterClass}` : "/api/timetable";
      const { data } = await api.get(url);
      if (data.success) {
        setTimetables(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  }, [filterClass]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleGenerate = async () => {
    if (!autoGenClass) return alert("Select a class to generate for.");
    
    // Validate that all subject lines have subject and teacher selected
    for (let i = 0; i < autoGenSubjects.length; i++) {
        if (!autoGenSubjects[i].subjectId || !autoGenSubjects[i].teacherId) {
            return alert(`Please select both Subject and Teacher on row ${i + 1}`);
        }
    }

    try {
      const payload = {
        classId: autoGenClass,
        subjectsData: autoGenSubjects,
        days: autoGenDays,
        timeSlots: autoGenSlots
      };
      
      const { data } = await api.post("/api/timetable/generate", payload);
      if (data.success) {
        alert(data.message);
        setFilterClass(autoGenClass); // Switch view to generated class
        fetchTimetable();
      }
    } catch (err) {
      alert("Generation failed: " + (err.response?.data?.message || err.message));
    }
  };

  const addSubjectSlot = () => {
    setAutoGenSubjects([...autoGenSubjects, { subjectId: "", teacherId: "", frequency: 1 }]);
  };

  const updateSubjectSlot = (index, field, value) => {
    const updated = [...autoGenSubjects];
    updated[index][field] = value;
    setAutoGenSubjects(updated);
  };

  const removeSubjectSlot = (index) => {
    const updated = autoGenSubjects.filter((_, i) => i !== index);
    setAutoGenSubjects(updated);
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      await api.delete(`/api/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <SectionCard 
        title="Auto-Generate Timetable" 
        subtitle="Use the DSA matching algorithm to instantly generate clash-free schedules for a cohort.">
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border-r border-slate-700/30 pr-6">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">1. Select Target Cohort</h4>
            <select 
              className={inputClasses} 
              value={autoGenClass} 
              onChange={(e) => setAutoGenClass(e.target.value)}
            >
              <option value="">Choose Class/Cohort...</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <h4 className="text-sm font-semibold text-slate-200 mt-6 mb-3">2. Work Days & Slots Defaults</h4>
            <div className="space-y-2 mb-4">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={autoGenDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) setAutoGenDays([...autoGenDays, day]);
                      else setAutoGenDays(autoGenDays.filter(d => d !== day));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
            
            <p className="text-xs text-slate-400">
              Generating across {autoGenDays.length} days with {autoGenSlots.length} time slots per day.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">3. Assign Subjects & Frequencies</h4>
            <p className="text-xs text-slate-400 mb-4 pb-2 border-b border-slate-700/30">
              Define how many periods per week each subject should be taught. The algorithm will ensure the same teacher or class isn't double-booked elsewhere across the system.
            </p>
            
            <div className="space-y-3">
              {autoGenSubjects.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select 
                    className={inputClasses} 
                    value={slot.subjectId} 
                    onChange={e => updateSubjectSlot(idx, "subjectId", e.target.value)}
                  >
                    <option value="">Subject...</option>
                    {subjects.filter(s => !autoGenClass || String(s.classId?._id || s.classId) === String(autoGenClass)).map(s => (
                      <option key={s._id} value={s._id}>{s.name || s.code}</option>
                    ))}
                  </select>

                  <select 
                    className={inputClasses} 
                    value={slot.teacherId} 
                    onChange={e => updateSubjectSlot(idx, "teacherId", e.target.value)}
                  >
                    <option value="">Teacher...</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center w-32 border border-gray-300 rounded-lg overflow-hidden shrink-0 h-[38px]">
                    <span className="bg-slate-800/30 px-2 text-xs text-slate-400 h-full flex items-center border-r border-gray-300">Freq</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      className="w-full px-2 outline-none text-sm text-center h-full" 
                      value={slot.frequency} 
                      onChange={e => updateSubjectSlot(idx, "frequency", Number(e.target.value))} 
                    />
                  </div>

                  <button 
                    onClick={() => removeSubjectSlot(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700/30">
              <button onClick={addSubjectSlot} className={btnClasses + " bg-slate-800/40 text-slate-200 hover:bg-gray-200 border border-slate-700/50"}>
                + Add Subject
              </button>
              <button onClick={handleGenerate} className={btnClasses + " bg-blue-500 hover:bg-blue-600 ml-auto"}>
                ✨ Generate Routine
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard 
        title="Timetable View" 
        subtitle="Current active schedules across the university.">
        
        <div className="mb-6 flex gap-4">
          <select 
            className={inputClasses + " max-w-xs"}
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          >
            <option value="">All Classes...</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={fetchTimetable} className={btnClasses + " bg-slate-800/40 text-slate-200 hover:bg-gray-200 border border-slate-700/50"}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading Timetable...</div>
        ) : timetables.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/30">
            No timetable entries found. Select a class and click generate!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/30 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Day</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timetables.map((tt) => (
                  <tr key={tt._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{tt.day}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-800">
                        {tt.time}
                      </span>
                    </td>
                    <td className="px-4 py-3">{tt.classId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-300">{tt.subjectId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-300">{tt.teacherId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => deleteEntry(tt._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
