import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Sun, Moon, AlertCircle, Disc3, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register, theme, toggleTheme } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register extra fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(usernameOrEmail.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regEmail.trim() || !regName.trim() || !regUsername.trim() || !regPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    try {
      setLoading(true);
      await register(regUsername.trim(), regEmail.trim(), regPassword, regName.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07070b] flex items-center justify-center p-4 selection:bg-pink-500 selection:text-white overflow-hidden">
      {/* Ambient Celestial Orbs Background */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl flex items-center justify-center gap-12">
        {/* Left Side: Celestial Device Preview (Desktop) */}
        <div className="hidden lg:flex relative w-[370px] h-[660px] aerogel-card-glow rounded-[48px] p-3 flex-shrink-0 items-center justify-center overflow-hidden border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Inner Phone Screen Preview */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black/90 flex flex-col justify-between p-4 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                Social Sphere
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-medium px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Universe
              </div>
            </div>

            {/* Post Showcase Card */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl my-auto border border-white/10 relative group">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
                alt="Social Sphere showcase"
                className="w-full aspect-square object-cover"
              />
              
              {/* Soundtrack Floating Badge */}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-pink-500/30 flex items-center justify-center border border-pink-500/40 text-pink-400">
                    <Disc3 className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className="text-[11px] font-semibold truncate">Midnight City Symphony</p>
                    <p className="text-[9px] text-zinc-400 truncate">Cosmic Waveform Audio</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 h-4">
                  {[40, 80, 100, 60, 90, 50].map((h, i) => (
                    <span 
                      key={i} 
                      style={{ height: `${h}%` }} 
                      className="w-0.5 bg-pink-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Caption Pill */}
            <div className="aerogel-card p-3 rounded-2xl border border-white/10 space-y-1 text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-cosmic p-[1.5px]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Mock avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-white">celestial.creator</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Experience next-gen social interactions with music soundtracks & WebRTC calls. ✨
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Celestial Auth Glass Capsule */}
        <div className="w-full max-w-[380px] space-y-4">
          <div className="aerogel-card-glow rounded-3xl p-8 border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col items-center">
            {/* Holographic Logo Glyph */}
            <div className="relative mb-4 group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-cosmic rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 p-[2px] border border-white/20 flex items-center justify-center shadow-xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-cosmic flex items-center justify-center text-white shadow-inner">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent mb-1 text-center">
              Social Sphere
            </h1>
            <p className="text-xs text-zinc-400 text-center mb-6">
              {isRegister ? 'Join the next generation of social media' : 'Welcome back to your universe'}
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isRegister ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="w-full space-y-3 text-xs">
                <div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or email"
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-3 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-3 pr-10 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-cosmic hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-3"
                >
                  {loading ? 'Entering Sphere...' : 'Log In'}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="w-full space-y-2.5 text-xs">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Mobile Number or Email"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />

                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />

                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Unique Username"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />

                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-cosmic hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-3"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          {/* Switcher Card */}
          <div className="aerogel-card rounded-2xl p-4 border border-white/10 text-center text-xs text-zinc-300">
            {!isRegister ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-bold ml-1 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-bold ml-1 transition-colors"
                >
                  Log In
                </button>
              </p>
            )}
          </div>

          {/* Theme Toggle Button */}
          <div className="flex justify-center pt-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs py-1.5 px-4 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{theme === 'dark' ? 'Light Atmosphere' : 'Dark Space'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

