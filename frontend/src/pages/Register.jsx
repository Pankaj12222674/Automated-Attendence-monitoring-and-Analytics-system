import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const Icons = {
  Academic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.477 10.48a3 3 0 104.243 4.242M9.88 5.09A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.297 5.135M6.228 6.228A9.956 9.956 0 002.458 12c1.274 4.057 5.064 7 9.542 7a9.96 9.96 0 005.08-1.39" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-2h6l2 2h4v12H3V7zm9 10a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  Face: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.65 18h16.7a1 1 0 00.86-1.5l-7.5-13a1 1 0 00-1.72 0z" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.813-2.096L5 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904zM18 13l.75 1.75L20.5 15l-1.75.75L18 17.5l-.75-1.75L15.5 15l1.75-.25L18 13zM16 5l.938 2.563L19.5 8.5l-2.562.938L16 12l-.938-2.562L12.5 8.5l2.562-.938L16 5z" />
    </svg>
  ),
};

function Register() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  }, []);

  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    setError("");

    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (err) {
      console.error(err);
      setError("Face recognition models could not be loaded. Please verify the /models directory.");
      setModelsLoaded(false);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();

    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  const startCamera = async () => {
    setError("");
    setSuccess("");

    if (!modelsLoaded) {
      setError("Models are still loading. Please wait a moment.");
      return;
    }

    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStarted(true);
    } catch (err) {
      console.error(err);
      setError("Camera access denied or unavailable on this device.");
    }
  };

  const captureFace = async () => {
    setError("");
    setSuccess("");

    if (!modelsLoaded) {
      setError("Models are still loading. Please wait before capturing.");
      return;
    }

    if (!cameraStarted || !videoRef.current) {
      setError("Please initialize the camera first.");
      return;
    }

    setCapturing(true);

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Ensure your face is fully visible and well-lit.");
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      setFaceDescriptor(descriptor);

      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Unable to generate profile image from capture.");
            return;
          }

          const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
          setImageFile(file);
          setSuccess("Face captured successfully. Your biometric identity is ready.");
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error(err);
      setError("Face capture failed. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!faceDescriptor) {
      setError("Please capture your face before registering.");
      return;
    }

    setRegistering(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("role", role);
      formData.append("faceDescriptor", JSON.stringify(faceDescriptor));

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      await axios.post(`${API}/auth/register`, formData);

      setSuccess("Registration successful. Redirecting to login...");
      stopCamera();

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden relative font-sans">
      {/* Colorful Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 max-w-7xl mx-auto">
        {/* Left Info Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14">
          <div>
            <div className="inline-flex items-center gap-3 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-cyan-400">
                  <Icons.Academic />
                </div>
              </div>
              <div>
                <p className="text-white font-black text-2xl tracking-tight">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Attendance</span>
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-500/80 font-bold mt-1">
                  Automated Monitoring System
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <Icons.Sparkles />
                Biometric Enrollment Active
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Establish your verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">academic identity.</span>
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                Create your institutional profile with highly secure credentials and automated biometric face enrollment for seamless attendance tracking.
              </p>

              <div className="grid sm:grid-cols-3 gap-5 mt-12">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-3">
                    Unified Access
                  </p>
                  <p className="text-slate-200 font-bold">Role Based</p>
                  <p className="text-xs text-slate-500 mt-2">Designed for Students, Faculty, and Admins.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-3">
                    Biometrics
                  </p>
                  <p className="text-slate-200 font-bold">Face Capture</p>
                  <p className="text-xs text-slate-500 mt-2">Powers the automated attendance workflow.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-3">
                    Security
                  </p>
                  <p className="text-slate-200 font-bold">Encrypted</p>
                  <p className="text-xs text-slate-500 mt-2">Credentials paired with biometric data safely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Register Panel */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10 relative z-20">
          <div className="w-full max-w-xl">
            {/* Glassmorphism Card */}
            <div className="bg-slate-900/70 border border-slate-700/50 shadow-2xl p-8 sm:p-10 rounded-[2.5rem] backdrop-blur-xl">
              
              {/* Mobile Brand */}
              <div className="flex justify-center lg:hidden mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] rounded-2xl">
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400">
                    <Icons.Academic />
                  </div>
                </div>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Complete your registration with biometric verification
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm font-medium flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <Icons.Alert />
                  <span className="pt-0.5">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm font-medium flex items-start gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Icons.Check />
                  <span className="pt-0.5">{success}</span>
                </div>
              )}

              <form onSubmit={registerUser} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* NAME */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="flex items-center bg-slate-950/50 border border-slate-700/80 rounded-2xl px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all duration-300">
                      <div className="mr-3">
                        <Icons.User />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full py-4 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-medium"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      University Email
                    </label>
                    <div className="flex items-center bg-slate-950/50 border border-slate-700/80 rounded-2xl px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all duration-300">
                      <div className="mr-3">
                        <Icons.Mail />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="student@university.edu"
                        className="w-full py-4 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <div className="flex items-center bg-slate-950/50 border border-slate-700/80 rounded-2xl px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all duration-300">
                      <div className="mr-3">
                        <Icons.Lock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full py-4 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-slate-500 hover:text-cyan-400 transition-colors ml-2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </div>

                  {/* ROLE */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Role
                    </label>
                    <div className="flex items-center bg-slate-950/50 border border-slate-700/80 rounded-2xl px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all duration-300">
                      <div className="mr-3">
                        <Icons.Academic />
                      </div>
                      <select
                        className="w-full py-4 bg-transparent text-white outline-none text-sm font-medium appearance-none cursor-pointer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option className="bg-slate-900 text-white" value="student">Student</option>
                        <option className="bg-slate-900 text-white" value="teacher">Faculty</option>
                        <option className="bg-slate-900 text-white" value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BIOMETRIC SECTION */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">Biometric Configuration</h3>
                      <p className="text-xs text-slate-500 mt-1">Status of AI recognition modules</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                        modelsLoaded
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                          : modelsLoading
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {modelsLoaded ? (
                        <><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Ready</>
                      ) : modelsLoading ? (
                        "Loading..."
                      ) : (
                        "Unavailable"
                      )}
                    </span>
                  </div>

                  {/* CAMERA BOX */}
                  <div className="bg-slate-950/60 border border-slate-700/80 rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-300 text-sm font-medium">Live Feed</p>
                      {faceDescriptor && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                          Capture Success
                        </span>
                      )}
                    </div>

                    <div className="bg-black/80 border border-slate-800 rounded-2xl overflow-hidden relative aspect-video flex items-center justify-center shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {!cameraStarted && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 backdrop-blur-sm">
                          <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
                            <Icons.Camera />
                          </div>
                          <p className="text-slate-400 text-sm font-medium">
                            Camera feed offline.<br/>Click initialize to begin.
                          </p>
                        </div>
                      )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="grid sm:grid-cols-2 gap-3 mt-5">
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={modelsLoading}
                        className="py-3.5 rounded-2xl text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Icons.Camera />
                        Initialize Camera
                      </button>

                      <button
                        type="button"
                        onClick={captureFace}
                        disabled={!cameraStarted || !modelsLoaded || capturing}
                        className="relative overflow-hidden py-3.5 rounded-2xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-transparent shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                      >
                        {capturing ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icons.Face />
                        )}
                        Capture Face
                      </button>
                    </div>
                  </div>
                </div>

                {/* REGISTER SUBMIT */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={registering || !faceDescriptor}
                    className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm tracking-wider uppercase"
                  >
                    {registering ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Complete Registration
                        <Icons.Shield />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm font-medium">
                  Already have an identity enrolled?
                  <Link
                    to="/login"
                    className="text-cyan-400 font-bold ml-2 hover:text-cyan-300 hover:underline underline-offset-4 transition-all"
                  >
                    Log In Here
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;