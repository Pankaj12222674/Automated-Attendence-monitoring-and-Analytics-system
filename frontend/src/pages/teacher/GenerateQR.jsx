import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Maximize: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Stop: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
};

export default function GenerateQR() {
  const query = useQuery();
  const navigate = useNavigate();

  const classId = query.get("classId");
  const subjectId = query.get("subjectId");
  const subjectName = query.get("subjectName") || "University Course";

  const token = localStorage.getItem("token");

  // Session States
  const [isActive, setIsActive] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [sessionType, setSessionType] = useState("lecture");
  
  // Timer & Rotation States
  const REFRESH_INTERVAL = 15; // Rotates every 15 seconds
  const [timeLeft, setTimeLeft] = useState(REFRESH_INTERVAL);
  
  // Geofencing States
  const [gpsCoords, setGpsCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Acquiring Satellite Lock...");

  // UI States
  const [projectorMode, setProjectorMode] = useState(false);

  /* ===============================
        GEOFENCING INITIALIZATION
  =============================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("GPS Not Supported - Geofencing Disabled");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus(`Geofence Locked: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocationStatus("GPS Access Denied - Geofencing Disabled");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ===============================
        DYNAMIC QR GENERATOR
  =============================== */
  const generateQR = async () => {
    if (!classId || !subjectId) return alert("Missing Cohort Details!");

    try {
      // Centralized api instance handles token and base URL
      const res = await api.post("/api/qr/generate", { 
        classId, 
        subjectId, 
        expiresIn: REFRESH_INTERVAL,
        sessionType,
        location: gpsCoords // Sends professor's location to tie to the token
      });

      setQrImage(res.data.qr);
      setTimeLeft(REFRESH_INTERVAL); // Reset the visual countdown
    } catch (err) {
      console.error(err);
      alert("Failed to generate secure token.");
      setIsActive(false);
    }
  };

  /* ===============================
        AUTO-ROTATION TIMER LOGIC
  =============================== */
  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      // Time's up! Fetch a new QR code automatically
      generateQR();
    }

    return () => clearTimeout(timer);
  }, [isActive, timeLeft]);

  /* ===============================
        CONTROLS
  =============================== */
  const startSession = () => {
    setIsActive(true);
    generateQR();
  };

  const stopSession = () => {
    setIsActive(false);
    setQrImage("");
    setProjectorMode(false);
  };

  /* ===============================
        PROJECTOR MODE UI (FULLSCREEN)
  =============================== */
  if (projectorMode && isActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-none">
        
        <div className="absolute top-8 text-center">
          <h1 className="text-5xl font-black text-white tracking-widest uppercase mb-2">{subjectName}</h1>
          <p className="text-2xl text-slate-400">Scan via University Portal App to log attendance</p>
        </div>

        {/* Massive QR Code for Lecture Halls */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_0_100px_rgba(99,102,241,0.3)]">
          <img src={qrImage} alt="Dynamic QR" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* High-Visibility Progress Bar */}
        <div className="absolute bottom-16 w-full max-w-4xl px-8">
          <div className="flex justify-between text-slate-500 text-xl font-bold mb-4 uppercase tracking-widest">
            <span>Dynamic Token Rotation</span>
            <span>{timeLeft}s</span>
          </div>
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / REFRESH_INTERVAL) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Exit Projector Mode */}
        <button 
          onClick={() => setProjectorMode(false)}
          className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition cursor-pointer"
        >
          <Icons.Stop />
        </button>
      </div>
    );
  }

  /* ===============================
        STANDARD INSTRUCTOR UI
  =============================== */
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative text-slate-200 pb-20 font-sans selection:bg-cyan-500/30 flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
      
      <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <button onClick={() => navigate("/teacher/dashboard")} className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2 mb-4">
              <Icons.ArrowLeft /> Exit Generator
            </button>
            <h1 className="text-3xl font-black text-white tracking-tight">Secure Check-In</h1>
            <p className="text-slate-400 mt-1">{subjectName} ({classId?.substring(0,6).toUpperCase()})</p>
          </div>
        </div>

        {/* Settings Panel (Only visible before session starts) */}
        {!isActive ? (
          <div className="space-y-6 relative z-10">
            
            {/* Geofence Status */}
            <div className="bg-slate-950/70 border border-slate-700/50 shadow-inner p-4 rounded-2xl flex items-center gap-3">
              <div className={`p-2 rounded-xl ${gpsCoords ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Icons.MapPin />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geofence Node</p>
                <p className="text-sm font-mono text-white mt-0.5">{locationStatus}</p>
              </div>
            </div>

            {/* Session Type */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Session Type</label>
              <select
                className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-4 rounded-2xl focus:border-cyan-500 outline-none transition"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Laboratory</option>
                <option value="seminar">Seminar</option>
                <option value="exam">Examination</option>
              </select>
            </div>

            {/* Warning Note */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-sm text-cyan-300 font-medium">
              Note: The cryptographic QR code will automatically rotate every {REFRESH_INTERVAL} seconds to prevent unauthorized proxy scanning.
            </div>

            <button
              onClick={startSession}
              disabled={!gpsCoords}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initialize Live Session
            </button>

          </div>
        ) : (
          
          /* ACTIVE SESSION PANEL */
          <div className="flex flex-col items-center relative z-10 animate-fadeUp">
            
            <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] mb-6">
              {qrImage ? (
                <img src={qrImage} alt="Live QR" className="w-64 h-64 object-contain" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Rotation Progress Bar */}
            <div className="w-full max-w-sm mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Token Refresh</span>
                <span className={timeLeft <= 3 ? "text-rose-400" : "text-cyan-400"}>{timeLeft}s</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? "bg-rose-500" : "bg-cyan-500"}`}
                  style={{ width: `${(timeLeft / REFRESH_INTERVAL) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-4">
              <button
                onClick={() => setProjectorMode(true)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Icons.Maximize /> Projector Mode
              </button>
              
              <button
                onClick={stopSession}
                className="flex-1 py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Icons.Stop /> End Session
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}