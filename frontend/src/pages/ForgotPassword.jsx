import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.813-2.096L5 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904zM18 13l.75 1.75L20.5 15l-1.75.75L18 17.5l-.75-1.75L15.5 15l1.75-.25L18 13zM16 5l.938 2.563L19.5 8.5l-2.562.938L16 12l-.938-2.562L12.5 8.5l2.562-.938L16 5z" />
    </svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendResetLink = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "http://localhost:8000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to send reset email"
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
                Secure Recovery Portal
              </div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Regain access to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">academic portal.</span>
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                Enter your institutional email address to securely receive a password reset link and restore your connection to the attendance network.
              </p>

              <div className="grid sm:grid-cols-2 gap-5 mt-12">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-3">
                    Security
                  </p>
                  <p className="text-slate-200 font-bold">Encrypted Links</p>
                  <p className="text-xs text-slate-500 mt-2">Reset tokens expire securely after use.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md hover:bg-slate-900/60 transition-colors">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-3">
                    Support
                  </p>
                  <p className="text-slate-200 font-bold">IT Helpdesk</p>
                  <p className="text-xs text-slate-500 mt-2">Contact admin if recovery fails.</p>
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
                  Recover Password
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Enter your email to receive recovery instructions
                </p>
              </div>

              {message && (
                <div className={`mb-6 p-4 border rounded-2xl text-sm font-medium flex items-start gap-3 shadow-lg ${
                  message.toLowerCase().includes("failed") || message.toLowerCase().includes("not found")
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                }`}>
                  <div className="mt-0.5">
                    <Icons.Info />
                  </div>
                  <span className="leading-relaxed">{message}</span>
                </div>
              )}

              <div className="space-y-5">
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
                      placeholder="student@university.edu"
                      className="w-full py-4 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendResetLink();
                      }}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    onClick={sendResetLink}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm tracking-wider uppercase"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Send Reset Link
                        <Icons.Shield />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* BACK TO LOGIN */}
              <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-cyan-400 transition-colors group"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform">
                    <Icons.ArrowLeft />
                  </span>
                  Return to Secure Login
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;