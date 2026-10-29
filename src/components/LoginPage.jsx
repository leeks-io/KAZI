import React, { useState } from 'react';
import { apiFetch } from '../api';

// Official Google "G" Logo
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [tab, setTab] = useState('signin'); // Default to 'signin' for easy immediate testing
  const [role, setRole] = useState('worker'); // 'worker' | 'employer'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states (No phone number!)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signin form states
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('leekstechio@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Leeks User');

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'info' | 'error' | 'success'

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Google Sign-In Execution
  const handleGoogleAuth = async (emailToUse, nameToUse) => {
    const targetEmail = (emailToUse || googleEmailInput || '').trim();
    if (!targetEmail) {
      showToast('Please provide a valid Google email.', 'error');
      return;
    }

    setIsLoading(true);
    setShowGoogleModal(false);

    try {
      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: nameToUse || googleNameInput || targetEmail.split('@')[0],
          role: role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.error || 'Google sign-in failed. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Store auth token and user data
      try {
        localStorage.setItem('kazi_token', data.token);
        localStorage.setItem('kazi_current_user', JSON.stringify(data.user));
        localStorage.setItem('kazi_active_view', data.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
      } catch (err) {}

      showToast(`Signed in with Google as ${data.user.email} 🎉`, 'success');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err) {
      console.error('Google sign-in request error:', err);
      showToast('Connection error during Google sign-in.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Telegram Auth
  const handleTelegramAuth = (e) => {
    if (e) e.preventDefault();
    try {
      const link = document.createElement('a');
      link.href = 'https://t.me/KaziAfrica_bot';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (_) {}

    const userObj = {
      name: role === 'employer' ? 'Telegram Employer' : 'Telegram Worker',
      email: `${role}_telegram@kazi.africa`,
      role: role,
      authProvider: 'telegram',
      telegramHandle: '@KaziAfrica_bot',
      token: 'kazi_telegram_' + Date.now()
    };

    try {
      localStorage.setItem('kazi_current_user', JSON.stringify(userObj));
      localStorage.setItem('kazi_active_view', role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
    } catch (err) {}

    showToast('Connecting to @KaziAfrica_bot... Welcome to Kazi! 🚀', 'success');
    setTimeout(() => {
      onLoginSuccess(userObj);
    }, 600);
  };

  // Quick Demo Login Helper
  // Regular Email/Password Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      showToast('Please enter your first name.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter a password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: '', // Phone number completely removed as requested
          password,
          role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.error || 'Signup failed. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Store auth token and user data
      try {
        localStorage.setItem('kazi_token', data.token);
        localStorage.setItem('kazi_current_user', JSON.stringify(data.user));
        localStorage.setItem('kazi_active_view', data.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
      } catch (err) {}

      showToast(data.message || `Account created! Welcome to Kazi, ${firstName} 🎉`, 'success');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch (err) {
      console.error('Signup request error:', err);
      showToast('Connection error. Please check your network and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Regular Email/Password Sign In
  const handleSignin = async (e) => {
    e.preventDefault();

    if (!signinEmail.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    if (!signinPassword) {
      showToast('Please enter your password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signinEmail.trim().toLowerCase(),
          password: signinPassword,
          role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.error || 'Sign in failed. Check your email or password.', 'error');
        setIsLoading(false);
        return;
      }

      // Store auth token and user data
      try {
        localStorage.setItem('kazi_token', data.token);
        localStorage.setItem('kazi_current_user', JSON.stringify(data.user));
        localStorage.setItem('kazi_active_view', data.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
      } catch (err) {}

      showToast(data.message || `Welcome back, ${data.user.name}! 🎉`, 'success');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch (err) {
      console.error('Signin request error:', err);
      showToast('Connection error. Please check your network and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#1C1C1E] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#F5A623] selection:text-white">
      {/* Mobile Top Header */}
      <nav className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#D8E8DF] sticky top-0 z-20">
        <div className="text-xl font-extrabold text-[#1A5C38]">
          Kaz<span className="text-[#F5A623]">i</span>
        </div>
        <div className="text-xs bg-[#E8F5EE] text-[#1A5C38] px-2.5 py-1 rounded-full font-semibold">
          🌍 Africa's Work Network
        </div>
      </nav>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Brand Showcase Panel (Left Half) */}
        <div className="hidden md:flex bg-[#1A5C38] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#2E7D52] rounded-full opacity-40 pointer-events-none" />
          <div className="absolute -bottom-15 -left-15 w-60 h-60 bg-[#F5A623] rounded-full opacity-15 pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-10 h-10 bg-[#2E7D52] rounded-full flex items-center justify-center text-white font-extrabold text-2xl relative shadow-md">
              K
              <span className="w-2.5 h-2.5 bg-[#F5A623] rounded-full absolute -top-0.5 -right-0.5 border-2 border-[#1A5C38]" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Kaz<span className="text-[#F5A623]">i</span>
            </span>
          </div>

          {/* Headline & Stats */}
          <div className="relative z-10 my-auto py-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#F5A623] mb-4 backdrop-blur-sm">
              ✨ Voice-First Informal Economy Job Matching
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Find work.<br />
              Hire workers.<br />
              <em className="not-italic text-[#F5A623]">Get things done.</em>
            </h1>
            <p className="text-base text-white/80 leading-relaxed max-w-sm mb-10">
              Africa's voice-first job network. Speak your skill, match verified roles in Lagos, Nairobi, Accra, and Kampala.
            </p>

            <div className="flex gap-8 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">500+</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Workers matched</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">120+</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Active employers</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">4</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Countries live</span>
              </div>
            </div>
          </div>

          {/* Footer tagline */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/50 font-medium">
            <span>Lagos · Nairobi · Accra · Kampala</span>
            <span>Secured with JWT & Google</span>
          </div>
        </div>

        {/* Auth Panel (Right Half) */}
        <div className="bg-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Top Tabs Switcher */}
            <div className="flex bg-[#F0F5F2] rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-[#1A5C38] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#1C1C1E]'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-[#1A5C38] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#1C1C1E]'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Role Selector Cards */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRole('worker')}
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                    role === 'worker'
                      ? 'border-[#1A5C38] bg-[#E8F5EE] shadow-sm'
                      : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/40'
                  }`}
                >
                  <span className="text-2xl">👷</span>
                  <span className="text-xs font-bold text-[#1C1C1E]">Find Work</span>
                  <span className="text-[11px] text-[#4A4A4A]">Job Seeker / Artisan</span>
                </div>

                <div
                  onClick={() => setRole('employer')}
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                    role === 'employer'
                      ? 'border-[#1A5C38] bg-[#E8F5EE] shadow-sm'
                      : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/40'
                  }`}
                >
                  <span className="text-2xl">🏢</span>
                  <span className="text-xs font-bold text-[#1C1C1E]">Hire Workers</span>
                  <span className="text-[11px] text-[#4A4A4A]">Employer / Recruiter</span>
                </div>
              </div>
            </div>

            {/* GOOGLE SIGN IN BUTTON (Prominent at top of both tabs) */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-[#D8E8DF] hover:border-[#4285F4] hover:bg-slate-50/80 rounded-xl text-sm font-semibold text-[#1C1C1E] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.99] group bg-white"
              >
                <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span>
                  {tab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 bg-[#E8F5EE] text-[#1A5C38] font-bold rounded uppercase">
                  Fast
                </span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E2EDE7]" />
                <span className="text-xs text-[#8A8A8A] font-medium whitespace-nowrap">
                  or with email
                </span>
                <div className="flex-1 h-px bg-[#E2EDE7]" />
              </div>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleSignin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#1C1C1E]">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Your password"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      className="w-full px-3.5 py-3 pr-10 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1C1C1E] cursor-pointer"
                    >
                      {showPassword ? (
                        <span className="text-xs font-bold text-[#1A5C38]">HIDE</span>
                      ) : (
                        <span className="text-xs font-bold text-[#8A8A8A]">SHOW</span>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 bg-[#1A5C38] hover:bg-[#2E7D52] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${role === 'employer' ? 'Employer' : 'Job Seeker'}`
                  )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTelegramAuth}
                    className="w-full py-2.5 border border-[#D8E8DF] hover:border-[#229ED9] hover:bg-[#F0F8FD] rounded-xl text-xs font-semibold text-[#1C1C1E] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="w-4 h-4 bg-[#229ED9] rounded-full flex items-center justify-center text-white text-[10px]">
                      ✈️
                    </span>
                    Sign in with Telegram Bot (@KaziAfrica_bot)
                  </button>
                </div>

                <p className="text-center text-xs text-[#8A8A8A] pt-3">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="text-[#1A5C38] font-bold hover:underline cursor-pointer"
                  >
                    Create one free
                  </button>
                </p>
              </form>
            )}

            {/* TAB 2: CREATE ACCOUNT FORM (No phone number!) */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">First name</label>
                    <input
                      type="text"
                      required
                      placeholder="Ada"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Last name</label>
                    <input
                      type="text"
                      placeholder="Okafor"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="ada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                  />
                </div>

                {/* Password (Notice: Phone number field has been removed!) */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-3 pr-10 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1C1C1E] cursor-pointer"
                    >
                      {showPassword ? (
                        <span className="text-xs font-bold text-[#1A5C38]">HIDE</span>
                      ) : (
                        <span className="text-xs font-bold text-[#8A8A8A]">SHOW</span>
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-[#8A8A8A] mt-1 block">
                    Must be at least 6 characters.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 bg-[#1A5C38] hover:bg-[#2E7D52] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99] mt-3 flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    `Join Kazi as ${role === 'employer' ? 'Employer' : 'Worker'}`
                  )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTelegramAuth}
                    className="w-full py-2.5 border border-[#D8E8DF] hover:border-[#229ED9] hover:bg-[#F0F8FD] rounded-xl text-xs font-semibold text-[#1C1C1E] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="w-4 h-4 bg-[#229ED9] rounded-full flex items-center justify-center text-white text-[10px]">
                      ✈️
                    </span>
                    Sign up with Telegram Bot (@KaziAfrica_bot)
                  </button>
                </div>

                <p className="text-center text-xs text-[#8A8A8A] pt-3">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="text-[#1A5C38] font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* GOOGLE SIGN-IN INTERACTIVE MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Google Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <GoogleIcon className="w-9 h-9 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Sign in with Google</h3>
              <p className="text-xs text-gray-500 mt-1">
                to continue to <strong className="text-[#1A5C38]">Kazi Platform</strong>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Google Account Email
                </label>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/60 focus-within:border-[#4285F4] focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {googleEmailInput ? googleEmailInput[0].toUpperCase() : 'G'}
                  </div>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
                    placeholder="name@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#4285F4]"
                  placeholder="e.g. Ada Okafor"
                />
              </div>

              {/* Role Confirmation in Google Sign In */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Sign in as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === 'worker'
                        ? 'border-[#1A5C38] bg-[#E8F5EE] text-[#1A5C38]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    👷 Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === 'employer'
                        ? 'border-[#1A5C38] bg-[#E8F5EE] text-[#1A5C38]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🏢 Employer
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(googleEmailInput, googleNameInput)}
                  className="flex-1 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-xs font-semibold shadow-xl z-50 transition-all ${
            toastType === 'error'
              ? 'bg-red-600 text-white'
              : toastType === 'success'
              ? 'bg-[#1A5C38] text-white'
              : 'bg-[#1C1C1E] text-white'
          }`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
