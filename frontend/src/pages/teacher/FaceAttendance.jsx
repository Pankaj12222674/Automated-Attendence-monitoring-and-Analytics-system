import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  FaceScan: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Stop: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
};

const FaceAttendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const [faceMatcher, setFaceMatcher] = useState(null);
  const [markedStudents, setMarkedStudents] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [loadingMsg, setLoadingMsg] = useState("Initializing Neural Nets...");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sessionType, setSessionType] = useState("lecture");

  const query = useQuery();
  const classId = query.get("classId");
  const subjectId = query.get("subjectId");
  const subjectName = query.get("subjectName") || "University Course";

  const token = localStorage.getItem("token");

  /* ===============================
        INIT & CLEANUP
  =============================== */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await loadModels();
        if (isMounted) await loadStudents();
      } catch (err) {
        if (isMounted) setLoadingMsg("Failed to initialize systems. Please refresh.");
      }
    };

    init();

    return () => {
      isMounted = false;
      stopCameraAndTracking();
    };
  }, [classId, token]);

  const stopCameraAndTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  /* ===============================
        LOAD FACE MODELS
  =============================== */
  const loadModels = async () => {
    const MODEL_URL = "/models";
    setLoadingMsg("Loading Biometric Models...");
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  };

  /* ===============================
        LOAD STUDENTS
  =============================== */
  const loadStudents = async () => {
    setLoadingMsg("Downloading Cohort Face Vectors...");
    try {
      // Using centralized api instance, headers handled automatically
      const res = await api.get(`/api/class/students/${classId}`);

      const students = res.data.students || [];
      const labeledDescriptors = [];
      const map = {};

      students.forEach(student => {
        if (student.faceDescriptor && student.faceDescriptor.length === 128) {
          const descriptor = new Float32Array(student.faceDescriptor);
          labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(student._id, [descriptor])
          );
          map[student._id] = student.name;
        }
      });

      if (labeledDescriptors.length === 0) {
        setLoadingMsg("Error: No registered biometric profiles found for this cohort.");
        return;
      }

      setStudentsMap(map);
      const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);
      setFaceMatcher(matcher);
      setLoadingMsg(""); // Clear loading state, ready to start

    } catch (err) {
      console.error("Student Load Error:", err);
      setLoadingMsg("Failed to load student profiles.");
    }
  };

  /* ===============================
        START CAMERA
  =============================== */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
          startFaceDetection();
        };
      }
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  };

  /* ===============================
        FACE DETECTION LOOP
  =============================== */
  const startFaceDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use a fixed resolution for consistent drawing
    const displaySize = { width: 720, height: 560 };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      if (!faceMatcher || !video) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach((detection) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const isUnknown = bestMatch.label === "unknown";
        
        const label = isUnknown ? "Unknown Entity" : studentsMap[bestMatch.label];

        // Draw bounding box (Green for known, Red for unknown)
        const drawBox = new faceapi.draw.DrawBox(
          detection.detection.box,
          {
            label,
            lineWidth: 2,
            boxColor: isUnknown ? "#ef4444" : "#10b981"
          }
        );
        drawBox.draw(canvas);

        if (!isUnknown) {
          const studentId = bestMatch.label;

          // If not already marked in this active session state
          setMarkedStudents(prev => {
            if (prev.includes(studentId)) return prev;

            // Fire API call asynchronously using centralized api instance
            api.post("/api/attendance/face-attendance", {
                studentId,
                classId,
                subjectId,
                sessionType // Pass the university session type
              })
              .catch(err => console.log("Silent API fail or already marked", err));

            // Return new array with this student
            return [...prev, studentId];
          });
        }
      });
    }, 1000); // Scans once per second to save CPU
  };


  /* ===============================
        RENDER UI
  =============================== */
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />
      
      {/* Header */}
      <div className="bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/teacher/dashboard" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2 mb-1">
              <Icons.ArrowLeft /> Exit Scanner
            </Link>
            <h1 className="text-xl font-bold text-white leading-tight">Biometric Capture</h1>
          </div>
          <div className="flex items-center gap-3">
             {isCameraActive && (
               <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Live
               </span>
             )}
             <span className="text-sm font-medium text-slate-400 hidden sm:block">{subjectName}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Controls & List */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Scanner Configuration</h2>
            
            {/* Session Type Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Session Type</label>
              <select
                disabled={isCameraActive}
                className="w-full bg-slate-950/70 border border-slate-700/50 shadow-inner text-white p-3.5 rounded-xl focus:border-cyan-500 outline-none transition disabled:opacity-50"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Laboratory</option>
                <option value="seminar">Seminar</option>
                <option value="exam">Examination</option>
              </select>
            </div>

            {loadingMsg ? (
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-center">
                <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-bold text-cyan-400">{loadingMsg}</p>
              </div>
            ) : !isCameraActive ? (
              <button
                onClick={startCamera}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] font-bold transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
              >
                <Icons.FaceScan /> Initialize Optics
              </button>
            ) : (
              <button
                onClick={stopCameraAndTracking}
                className="w-full py-3.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Icons.Stop /> Halt Scanning
              </button>
            )}
          </div>

          {/* Scanned Students List */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Verified Roster</h2>
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">{markedStudents.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-full pr-2 space-y-2">
              {markedStudents.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Awaiting face captures...</p>
              ) : (
                markedStudents.map(id => (
                  <div key={id} className="flex items-center gap-3 p-3 bg-slate-950 border border-emerald-500/20 rounded-xl animate-fadeUp">
                    <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full">
                      <Icons.Check />
                    </div>
                    <p className="font-bold text-sm text-slate-300">{studentsMap[id]}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Camera HUD */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500 p-4 rounded-3xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Target Brackets UI */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-cyan-500/50 rounded-tl-2xl z-10 pointer-events-none hidden sm:block"></div>
          <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-cyan-500/50 rounded-tr-2xl z-10 pointer-events-none hidden sm:block"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-cyan-500/50 rounded-bl-2xl z-10 pointer-events-none hidden sm:block"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-cyan-500/50 rounded-br-2xl z-10 pointer-events-none hidden sm:block"></div>

          <div className="relative bg-black rounded-2xl overflow-hidden w-full max-w-[720px] aspect-video sm:aspect-auto sm:h-[560px] shadow-2xl flex items-center justify-center">
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-slate-500">
                <Icons.FaceScan />
                <p className="text-xs font-bold uppercase tracking-widest mt-2">Optics Offline</p>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width="720"
              height="560"
              className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* The overlay canvas where the green/red boxes are drawn */}
            <canvas
              ref={canvasRef}
              width="720"
              height="560"
              className="absolute top-0 left-0 w-full h-full object-cover z-10"
            />
          </div>
          
          <p className="text-xs text-slate-500 font-medium mt-4 text-center">
            Faces must be centrally aligned. Red bounding boxes indicate unregistered biometric profiles.
          </p>
        </div>

      </div>
    </div>
  );
};

export default FaceAttendance;