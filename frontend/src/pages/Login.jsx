import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const Icons = {
  Academic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
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
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.65 18h16.7a1 1 0 00.86-1.5l-7.5-13a1 1 0 00-1.72 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  SSO: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.813-2.096L5 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904zM18 13l.75 1.75L20.5 15l-1.75.75L18 17.5l-.75-1.75L15.5 15l1.75-.25L18 13zM16 5l.938 2.563L19.5 8.5l-2.562.938L16 12l-.938-2.562L12.5 8.5l2.562-.938L16 5z" />
    </svg>
  ),
};

function getDashboardPath(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "teacher") return "/teacher/dashboard";
  return "/student/dashboard";
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (token && (savedUser || savedRole)) {
      navigate(getDashboardPath(savedRole || JSON.parse(savedUser || "{}")?.role), {
        replace: true,
      });
    }
  }, [navigate, token]);

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      const { user, token } = res.data;

      // Store credentials for route protection + downstream pages
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("id", user._id || user.id || "");
      localStorage.setItem("name", user.name || "");

      // Optional remember flag for future use
      localStorage.setItem("rememberMe", JSON.stringify(rememberMe));

      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden relative font-sans">
      {/* Colorful Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmurlCtncmlkKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />

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
                Secure Portal Access
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Welcome back to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">academic workspace.</span>
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                Access live attendance analytics, student records, and faculty monitoring dashboards through one secure institutional gateway.
              </p>

              <div className="grid sm:grid-cols-3 gap-5 mt-12">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-3">
                    Security
                  </p>
                  <p className="text-slate-200 font-bold">Protected Routing</p>
                  <p className="text-xs text-slate-500 mt-2">Role-aware infrastructure.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-3">
                    Access
                  </p>
                  <p className="text-slate-200 font-bold">Unified Login</p>
                  <p className="text-xs text-slate-500 mt-2">Students, Faculty, & Admin.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-3">
                    Reliability
                  </p>
                  <p className="text-slate-200 font-bold">Session State</p>
                  <p className="text-xs text-slate-500 mt-2">Smart redirect tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10 relative z-20">
          <div className="w-full max-w-md">
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
                  Central Auth
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Secure login for institutional users
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm font-medium flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <Icons.Alert />
                  <span className="pt-0.5">{error}</span>
                </div>
              )}

              <form onSubmit={loginUser} className="space-y-5">
                {/* EMAIL */}
                <div className="space-y-1.5">
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
                      autoComplete="email"
                      placeholder="netid@university.edu"
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
                      autoComplete="current-password"
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

                {/* REMEMBER + FORGOT */}
                <div className="flex items-center justify-between gap-3 pt-2 pb-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-5 h-5 rounded border border-slate-600 bg-slate-900 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
                      </svg>
                    </div>
                    <span className="group-hover:text-slate-300 transition-colors">Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* LOGIN BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm tracking-wider uppercase"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Access Dashboard
                        <Icons.ArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SSO */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  className="w-full py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <Icons.SSO />
                  </div>
                  Login via University SSO
                </button>

                <div className="mt-5 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-xs text-slate-400 flex items-start gap-3">
                  <div className="text-cyan-400 mt-0.5 shrink-0">
                    <Icons.Shield />
                  </div>
                  <p className="leading-relaxed">
                    Your portal securely tracks your active session and uses role-based routing to direct you to your designated dashboard upon authentication.
                  </p>
                </div>
              </div>
            </div>

            {/* REGISTER */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm font-medium">
                New admission or faculty transfer?
                <Link
                  to="/register"
                  className="text-cyan-400 font-bold ml-2 hover:text-cyan-300 hover:underline underline-offset-4 transition-all"
                >
                  Register Here
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;