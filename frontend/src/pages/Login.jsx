import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

const Icons = {
  Academic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  SSO: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      const res = await axios.post(`${API}/auth/login`, {
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
                  Secure Academic Access
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.22em] mb-6">
                <Icons.Sparkles />
                Enterprise-ready Identity Gateway
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight">
                Welcome back to your university command space.
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl">
                Access academic records, attendance systems, learning modules, and
                faculty operations through one secure institutional portal.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mt-10">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Security
                  </p>
                  <p className="text-white font-bold">Protected Route Control</p>
                  <p className="text-xs text-slate-500 mt-2">Role-aware institutional access.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Access
                  </p>
                  <p className="text-white font-bold">Students • Faculty • Admin</p>
                  <p className="text-xs text-slate-500 mt-2">Unified sign-in experience.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-2">
                    Reliability
                  </p>
                  <p className="text-white font-bold">Session-aware routing</p>
                  <p className="text-xs text-slate-500 mt-2">Returns users to intended pages.</p>
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
                <p className="text-white font-semibold">Institution-grade access control</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Your credentials are used to authenticate access by role and redirect you to
                  the correct protected workspace after successful login.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="bg-slate-900/90 border border-white/5 shadow-2xl p-8 sm:p-10 rounded-[2rem] backdrop-blur-xl">
              {/* Mobile Brand */}
              <div className="flex justify-center lg:hidden mb-6">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Icons.Academic />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Central Auth Portal
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  Secure login for students, faculty, and staff
                </p>
              </div>

              {error ? (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm font-medium flex items-start gap-3">
                  <Icons.Alert />
                  <span>{error}</span>
                </div>
              ) : null}

              <form onSubmit={loginUser}>
                {/* EMAIL */}
                <div className="mb-4">
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
                      autoComplete="email"
                      placeholder="netid@university.edu"
                      className="w-full py-3.5 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-2">
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
                      autoComplete="current-password"
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

                {/* REMEMBER + FORGOT */}
                <div className="flex items-center justify-between gap-3 mb-8 mt-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/40"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 font-medium hover:text-indigo-300 transition"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Access Portal
                      <Icons.ArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* SSO */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-center text-slate-500 text-xs mb-4 uppercase tracking-wider font-bold">
                  Alternative Institutional Sign-In
                </p>

                <button
                  type="button"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Icons.SSO />
                  Login via University SSO
                </button>

                <div className="mt-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-3 text-xs text-slate-400 flex items-start gap-2">
                  <div className="text-indigo-400 mt-0.5">
                    <Icons.Shield />
                  </div>
                  <p>
                    Your portal uses role-based routing after authentication and preserves
                    protected-route redirects when applicable.
                  </p>
                </div>
              </div>
            </div>

            {/* REGISTER */}
            <p className="text-center text-slate-400 text-sm mt-8">
              New admission or faculty transfer?
              <Link
                to="/register"
                className="text-indigo-400 font-bold ml-1 hover:text-indigo-300 transition"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;