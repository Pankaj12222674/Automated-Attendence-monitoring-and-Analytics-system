import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

const Icons = {
  Academic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.477 10.48a3 3 0 104.243 4.242M9.88 5.09A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.297 5.135M6.228 6.228A9.956 9.956 0 002.458 12c1.274 4.057 5.064 7 9.542 7a9.96 9.96 0 005.08-1.39" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-2h6l2 2h4v12H3V7zm9 10a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  Face: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="min-h-screen bg-[#060913] text-slate-200 overflow-hidden relative">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_30%)]" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#4f46e5_1px,_transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-indigo-600/20 rounded-full blur-[110px]" />
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-violet-600/10 rounded-full blur-[110px]" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left Info Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 border-r border-white/5">
          <div>
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.12)]">
                <Icons.Academic />
              </div>
              <div>
                <p className="text-white font-black text-xl tracking-tight">
                  Central<span className="text-indigo-400 font-light">Portal</span>
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">
                  Identity Enrollment Gateway
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.22em] mb-6">
                <Icons.Sparkles />
                Biometric-ready Registration
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight">
                Establish your verified academic identity.
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl">
                Create your institutional access profile with secure credentials and biometric
                face enrollment for modern attendance workflows.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mt-10">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Enrollment
                  </p>
                  <p className="text-white font-bold">Student • Faculty • Admin</p>
                  <p className="text-xs text-slate-500 mt-2">Unified identity creation flow.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Biometrics
                  </p>
                  <p className="text-white font-bold">Face descriptor capture</p>
                  <p className="text-xs text-slate-500 mt-2">Used for advanced attendance systems.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Security
                  </p>
                  <p className="text-white font-bold">Protected onboarding</p>
                  <p className="text-xs text-slate-500 mt-2">Credential + image registration flow.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm max-w-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-emerald-400">
                <Icons.Shield />
              </div>
              <div>
                <p className="text-white font-semibold">Identity verification workflow</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Complete your profile, initialize the camera, capture your face, and then
                  submit your registration to establish institutional identity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Register Panel */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-xl">
            <div className="bg-slate-900/90 border border-white/5 shadow-2xl p-8 sm:p-10 rounded-[2rem] backdrop-blur-xl">
              {/* Mobile Brand */}
              <div className="flex justify-center lg:hidden mb-6">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Icons.Academic />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Create Account
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  Register with credentials and biometric face capture
                </p>
              </div>

              {error ? (
                <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm font-medium flex items-start gap-3">
                  <Icons.Alert />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm font-medium flex items-start gap-3">
                  <Icons.Check />
                  <span>{success}</span>
                </div>
              ) : null}

              <form onSubmit={registerUser}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* NAME */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      Full Name
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <div className="mr-2">
                        <Icons.User />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full py-3.5 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      University Email
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <div className="mr-2">
                        <Icons.Mail />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="netid@university.edu"
                        className="w-full py-3.5 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      Password
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <div className="mr-2">
                        <Icons.Lock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full py-3.5 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-slate-500 hover:text-slate-300 transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </div>

                  {/* ROLE */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      Role
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <div className="mr-2 text-slate-500">
                        <Icons.Academic />
                      </div>
                      <select
                        className="w-full py-3.5 bg-transparent text-white outline-none text-sm"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option className="text-black" value="student">
                          Student
                        </option>
                        <option className="text-black" value="teacher">
                          Teacher
                        </option>
                        <option className="text-black" value="admin">
                          Admin
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MODEL STATUS */}
                <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/80 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-slate-400 font-medium">Face recognition models</span>
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        modelsLoaded
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : modelsLoading
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}
                    >
                      {modelsLoaded ? "Ready" : modelsLoading ? "Loading" : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* CAMERA BOX */}
                <div className="mt-5 bg-slate-950/80 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-white font-semibold">Biometric Capture</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Position your face inside the frame and look straight ahead.
                      </p>
                    </div>

                    {faceDescriptor ? (
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                        Captured
                      </span>
                    ) : null}
                  </div>

                  <div className="bg-black/50 border border-white/5 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!cameraStarted ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
                          <Icons.Camera />
                        </div>
                        <p className="text-slate-400 text-sm">
                          Camera not initialized yet.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={modelsLoading}
                      className="py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/30 transition font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Icons.Camera />
                      Initialize Camera
                    </button>

                    <button
                      type="button"
                      onClick={captureFace}
                      disabled={!cameraStarted || !modelsLoaded || capturing}
                      className="py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500/30 transition font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {capturing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Icons.Face />
                      )}
                      Capture Face
                    </button>
                  </div>
                </div>

                {/* REGISTER */}
                <button
                  type="submit"
                  disabled={registering || !faceDescriptor}
                  className="w-full mt-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition duration-300 shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {registering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Register & Establish Identity
                      <Icons.Shield />
                    </>
                  )}
                </button>
              </form>

              {/* SSO / alt actions */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-center text-slate-500 text-xs mb-4 uppercase tracking-wider font-bold">
                  Alternative Institutional Enrollment
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button type="button" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-sm font-medium text-slate-300 transition">
                    Google
                  </button>
                  <button type="button" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-sm font-medium text-slate-300 transition">
                    Microsoft
                  </button>
                  <button type="button" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-sm font-medium text-slate-300 transition">
                    SSO
                  </button>
                </div>

                <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-3 text-xs text-slate-400 flex items-start gap-2">
                  <div className="text-indigo-400 mt-0.5">
                    <Icons.Shield />
                  </div>
                  <p>
                    Your face descriptor and profile capture are included in registration to
                    support modern attendance verification workflows.
                  </p>
                </div>
              </div>
            </div>

            {/* LOGIN */}
            <p className="text-center text-slate-400 text-sm mt-8">
              Already have an account?
              <Link
                to="/login"
                className="text-indigo-400 font-bold ml-1 hover:text-indigo-300 transition"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
