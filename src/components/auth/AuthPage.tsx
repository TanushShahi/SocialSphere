import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  
  // Login Fields
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Mockup phone screenshot carousel index
  const [screenshotIdx, setScreenshotIdx] = useState(0);
  const screenshots = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setScreenshotIdx(prev => (prev + 1) % screenshots.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [screenshots.length]);

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
      setErrorMsg(err.message || 'Sorry, your password was incorrect. Please double-check.');
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
      setErrorMsg('Please fill in all fields to register.');
      return;
    }

    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }

    if (pwd.length < 4) {
      setErrorMsg('Password should be at least 4 characters.');
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

  // Quick 1-Tap Demo Logins / Registration for fast zero-friction testing
  const handleQuickDemo = async (demoUser: { u: string; e: string; n: string }) => {
    setErrorMsg('');
    setLoading(true);
    try {
      // First attempt to log in
      await login(demoUser.u, 'password123');
    } catch {
      try {
        // If account doesn't exist, create it on the fly
        await register(demoUser.u, demoUser.e, 'password123', demoUser.n);
      } catch (regErr: any) {
        setErrorMsg(regErr.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLoginValid = usernameOrEmail.trim().length > 0 && password.length >= 4;
  const isRegisterValid = regEmail.trim().length > 0 && regName.trim().length > 0 && regUsername.trim().length >= 3 && regPassword.length >= 4;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white antialiased">
      {/* Main Center Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[935px] flex items-center justify-center gap-10">
          
          {/* Left Side: Instagram Phone Frame Showcase (Desktop Only) */}
          <div className="hidden lg:block relative w-[380px] h-[610px] flex-shrink-0 select-none">
            {/* Phone Bezel */}
            <div className="relative w-full h-full rounded-[44px] p-3 bg-zinc-900 border-4 border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Dynamic Screen Carousel */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black">
                {screenshots.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Preview ${i}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      i === screenshotIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  />
                ))}

                {/* Ambient Instagram Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Notch & Brand Badge */}
                <div className="absolute top-4 left-0 right-0 px-5 flex items-center justify-between text-white/90">
                  <span className="font-['Grandista'] text-lg tracking-wider">SocialSphere</span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Live
                  </span>
                </div>

                {/* Bottom Mock Floating Card */}
                <div className="absolute bottom-5 left-4 right-4 p-3 rounded-2xl bg-black/75 border border-white/10 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-cosmic p-[1px]">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="text-xs font-bold">aurora.creator</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-tight">
                    Explore multi-photo carousels, musical soundtracks, and instant stories.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Instagram Clean Box */}
          <div className="w-full max-w-[350px] flex flex-col items-center space-y-3">
            
            {/* Primary Instagram Card */}
            <div className="w-full bg-zinc-950 sm:border sm:border-zinc-800 rounded-none sm:rounded-xl px-8 sm:px-10 py-8 flex flex-col items-center shadow-lg">
              
              {/* Instagram Script Brand Logo */}
              <div className="mb-6 text-center select-none">
                <h1 className="font-['Grandista'] text-4xl sm:text-[42px] tracking-wide text-white drop-shadow-sm">
                  SocialSphere
                </h1>
                <p className="text-xs text-zinc-400 mt-1 font-normal">
                  {isRegister ? 'Sign up to see photos and stories from friends.' : 'Instagram-grade Social Experience'}
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="w-full mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {/* Quick 1-Tap Demo Testing Pill */}
              <div className="w-full mb-4">
                <div className="text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Fast 1-Tap Access:</span>
                  <span className="text-pink-400 text-[10px] flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> Quick Demo
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo({ u: 'tanush', e: 'tanush@sphere.app', n: 'Tanush Shahi' })}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-[11px] text-zinc-200 border border-zinc-800 rounded-lg truncate text-center font-medium transition-colors"
                  >
                    ⚡ Tanush (Owner)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo({ u: 'alex_creator', e: 'alex@sphere.app', n: 'Alex Rivera' })}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-[11px] text-zinc-200 border border-zinc-800 rounded-lg truncate text-center font-medium transition-colors"
                  >
                    ⚡ Alex (Creator)
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3 my-3">
                <div className="flex-1 h-[1px] bg-zinc-800"></div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">or</span>
                <div className="flex-1 h-[1px] bg-zinc-800"></div>
              </div>

              {!isRegister ? (
                /* ================= LOG IN FORM ================= */
                <form onSubmit={handleLoginSubmit} className="w-full space-y-2 text-xs">
                  {/* Username/Email Input */}
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="username"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Phone number, username, or email"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 pr-12 text-xs focus:outline-none transition-colors"
                    />
                    {password.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>

                  {/* Log In Button */}
                  <button
                    type="submit"
                    disabled={loading || !isLoginValid}
                    className="w-full mt-2 py-2 bg-[#0095f6] hover:bg-[#1877f2] active:opacity-80 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Log in'
                    )}
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center pt-3">
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); setErrorMsg('Please use 1-Tap Demo login or register a new account.'); }} className="text-[11px] text-zinc-400 hover:text-white transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </form>
              ) : (
                /* ================= SIGN UP FORM ================= */
                <form onSubmit={handleRegisterSubmit} className="w-full space-y-2 text-xs">
                  {/* Email */}
                  <input
                    type="email"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Mobile Number or Email"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 text-xs focus:outline-none transition-colors"
                  />

                  {/* Full Name */}
                  <input
                    type="text"
                    autoComplete="name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 text-xs focus:outline-none transition-colors"
                  />

                  {/* Username */}
                  <input
                    type="text"
                    autoComplete="username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 text-xs focus:outline-none transition-colors"
                  />

                  {/* Password with Show/Hide */}
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 rounded-md px-3 py-2.5 pr-12 text-xs focus:outline-none transition-colors"
                    />
                    {regPassword.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        {showRegPassword ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>

                  {/* Terms disclaimer */}
                  <p className="text-[10px] text-zinc-500 text-center leading-normal pt-1 px-1">
                    By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                  </p>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading || !isRegisterValid}
                    className="w-full mt-2 py-2 bg-[#0095f6] hover:bg-[#1877f2] active:opacity-80 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Card: Switch between Log in and Sign up */}
            <div className="w-full bg-zinc-950 sm:border sm:border-zinc-800 rounded-none sm:rounded-xl p-4 text-center text-xs text-zinc-300">
              {!isRegister ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setErrorMsg('');
                    }}
                    className="text-[#0095f6] hover:text-[#1877f2] font-semibold ml-1 transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setErrorMsg('');
                    }}
                    className="text-[#0095f6] hover:text-[#1877f2] font-semibold ml-1 transition-colors"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>

            {/* App Promotion / Get the app */}
            <div className="w-full text-center space-y-2 pt-2">
              <span className="text-xs text-zinc-400">Get the app.</span>
              <div className="flex items-center justify-center gap-2">
                <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 font-medium">
                  App Store
                </div>
                <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 font-medium">
                  Google Play
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Instagram Meta Footer */}
      <footer className="w-full py-5 px-4 text-center text-[11px] text-zinc-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Meta</span>
          <span>About</span>
          <span>Blog</span>
          <span>Jobs</span>
          <span>Help</span>
          <span>API</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Locations</span>
          <span>SocialSphere Lite</span>
          <span>Threads</span>
          <span>Contact Uploading & Non-Users</span>
        </div>
        <div>
          <span>English &copy; 2026 SocialSphere from Meta</span>
        </div>
      </footer>
    </div>
  );
};
