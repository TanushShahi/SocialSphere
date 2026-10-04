import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const u = usernameOrEmail.trim();
    const p = password;
    if (!u || !p) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(u, p);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const email = regEmail.trim();
    const name = regName.trim();
    const username = regUsername.trim();
    const pwd = regPassword;

    if (!email || !name || !username || !pwd) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }

    if (pwd.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    try {
      setLoading(true);
      await register(username, email, pwd, name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  const isLoginValid = usernameOrEmail.trim().length > 0 && password.length >= 4;
  const isRegisterValid = regEmail.trim().length > 0 && regName.trim().length > 0 && regUsername.trim().length >= 3 && regPassword.length >= 4;

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white antialiased relative overflow-hidden">
      
      {/* Subtle Ambient Cosmic Background Glow (Ultra Lightweight - Zero Lag) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-purple-900/20 via-pink-600/10 to-transparent pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-indigo-900/15 pointer-events-none rounded-full" />

      {/* Main Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          {/* Main Card Styled Matching App Aesthetic */}
          <div className="w-full bg-zinc-950/80 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col items-center backdrop-blur-xl">
            
            {/* Prominent Visible App Icon */}
            <div className="relative mb-4 group cursor-pointer">
              {/* Outer Cosmic Gradient Ring */}
              <div className="w-20 h-20 rounded-2xl p-[2px] bg-gradient-cosmic shadow-[0_0_35px_rgba(236,72,153,0.45)] group-hover:scale-105 transition-transform flex items-center justify-center">
                <img 
                  src="./icon-192.png" 
                  alt="Social Sphere Icon" 
                  className="w-full h-full object-cover rounded-2xl bg-black"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border border-pink-500/50 flex items-center justify-center text-pink-400 shadow-md">
                <Sparkles className="w-3 h-3 animate-pulse" />
              </div>
            </div>

            {/* App Branding Typography matching the App UI */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                Social Sphere
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {activeTab === 'login' ? 'Welcome back to your universe' : 'Join the next generation of social media'}
              </p>
            </div>

            {/* Segmented Tab Switcher matching the App Navigation style */}
            <div className="w-full grid grid-cols-2 p-1 bg-white/[0.05] border border-white/10 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Alert Box */}
            {errorMsg && (
              <div className="w-full mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* ================= LOG IN FORM ================= */
              <form onSubmit={handleLoginSubmit} className="w-full space-y-3 text-xs">
                <div>
                  <input
                    type="text"
                    autoComplete="username"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or email"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-3 pr-11 text-xs focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLoginValid}
                  className="w-full mt-2 py-3 bg-gradient-cosmic hover:opacity-95 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all text-xs disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Enter Sphere</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ================= SIGN UP FORM ================= */
              <form onSubmit={handleRegisterSubmit} className="w-full space-y-2.5 text-xs">
                <input
                  type="email"
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Mobile number or email"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all"
                />

                <input
                  type="text"
                  autoComplete="name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all"
                />

                <input
                  type="text"
                  autoComplete="username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Unique username"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all"
                />

                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 pr-11 text-xs focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 text-center leading-normal pt-1">
                  By joining, you agree to our Terms, Privacy Policy & Community Guidelines.
                </p>

                <button
                  type="submit"
                  disabled={loading || !isRegisterValid}
                  className="w-full mt-2 py-3 bg-gradient-cosmic hover:opacity-95 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all text-xs disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Bottom Switcher Note */}
          <div className="w-full text-center mt-4">
            <span className="text-xs text-zinc-400">
              {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
            </span>{' '}
            <button
              type="button"
              onClick={() => {
                setActiveTab(activeTab === 'login' ? 'register' : 'login');
                setErrorMsg('');
              }}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold ml-1 transition-colors"
            >
              {activeTab === 'login' ? 'Sign up now' : 'Log in here'}
            </button>
          </div>

        </div>
      </main>

      {/* Sleek App Footer */}
      <footer className="w-full py-4 px-4 text-center text-[11px] text-zinc-500 space-y-1 border-t border-white/5 bg-zinc-950/40">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Social Sphere Network</span>
          <span>•</span>
          <span>Spatial Universe</span>
          <span>•</span>
          <span>Privacy & Security</span>
          <span>•</span>
          <span>v13.0 Live</span>
        </div>
        <p className="text-[10px] text-zinc-600">
          &copy; 2026 Social Sphere. Powered by WebRTC & Cosmic Audio Engine.
        </p>
      </footer>
    </div>
  );
};
