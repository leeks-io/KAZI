import React, { useState } from 'react';
import { apiFetch } from '../api';

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [tab, setTab] = useState('signup'); // 'signup' | 'signin'
  const [role, setRole] = useState('worker'); // 'worker' | 'employer'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Signin form states
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'info' | 'error' | 'success'

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTelegramAuth = (e) => {
    if (e) e.preventDefault();
    window.open('https://t.me/KaziAfrica_bot', '_blank', 'noopener,noreferrer');

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
    } catch (err) {}

    showToast('Connecting to @KaziAfrica_bot... Welcome to Kazi! 🚀', 'success');
    setTimeout(() => {
      onLoginSuccess(userObj);
    }, 600);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      showToast('Please enter your first name.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
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
          email: email.trim(),
          phone: phone.trim(),
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
          email: signinEmail.trim(),
          password: signinPassword,
          role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.error || 'Sign in failed. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Store auth token and user data
      try {
        localStorage.setItem('kazi_token', data.token);
        localStorage.setItem('kazi_current_user', JSON.stringify(data.user));
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
      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#D8E8DF] sticky top-0 z-20">
        <div className="text-xl font-extrabold text-[#1A5C38]">
          Kaz<span className="text-[#F5A623]">i</span>
        </div>
        <div className="text-xs bg-[#E8F5EE] text-[#1A5C38] px-2.5 py-1 rounded-full font-semibold">
          🌍 Africa's Work Network
        </div>
      </nav>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Brand Panel (Left Half) */}
        <div className="hidden md:flex bg-[#1A5C38] p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#2E7D52] rounded-full opacity-40 pointer-events-none" />
          <div className="absolute -bottom-15 -left-15 w-60 h-60 bg-[#F5A623] rounded-full opacity-15 pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#2E7D52" />
              <text x="8" y="28" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="22" fontWeight="800" fill="white">K</text>
              <circle cx="30" cy="12" r="5" fill="#F5A623" />
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Kaz<span className="text-[#F5A623]">i</span>
            </span>
          </div>

          {/* Headline & Stats */}
          <div className="relative z-10 my-auto py-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Find work.<br />
              Hire workers.<br />
              <em className="not-italic text-[#F5A623]">Get things done.</em>
            </h1>
            <p className="text-base text-white/70 leading-relaxed max-w-sm mb-10">
              Africa's voice-first job network. Chat on Telegram or the web — speak your skill, find your match, start earning.
            </p>
            
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">500+</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Workers matched</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">120+</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Companies hiring</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-white">4</span>
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Countries live</span>
              </div>
            </div>
          </div>

          {/* Footer tagline */}
          <div className="relative z-10">
            <p className="text-xs text-white/40 font-medium">Lagos · Nairobi · Accra · Kampala</p>
          </div>
        </div>

        {/* Auth Panel (Right Half) */}
        <div className="bg-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Tabs Header */}
            <div className="flex bg-[#F7FAF8] rounded-xl p-1 mb-8">
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-[#1A5C38] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#1C1C1E]'
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-[#1A5C38] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#1C1C1E]'
                }`}
              >
                Sign in
              </button>
            </div>

            {/* CREATE ACCOUNT FORM */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1.5">Join Kazi</h2>
                  <p className="text-sm text-[#8A8A8A]">Create your account and start in minutes.</p>
                </div>

                {/* Role Selector Cards */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  <div
                    onClick={() => setRole('worker')}
                    className={`border-2 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 ${
                      role === 'worker'
                        ? 'border-[#1A5C38] bg-[#E8F5EE]'
                        : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/50'
                    }`}
                  >
                    <span className="text-2xl">👷</span>
                    <span className="text-xs font-bold text-[#1C1C1E]">Find Work</span>
                    <span className="text-[11px] text-[#8A8A8A]">I'm looking for jobs or gigs</span>
                  </div>

                  <div
                    onClick={() => setRole('employer')}
                    className={`border-2 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 ${
                      role === 'employer'
                        ? 'border-[#1A5C38] bg-[#E8F5EE]'
                        : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/50'
                    }`}
                  >
                    <span className="text-2xl">🏢</span>
                    <span className="text-xs font-bold text-[#1C1C1E]">Hire Workers</span>
                    <span className="text-[11px] text-[#8A8A8A]">I need to fill a role or gig</span>
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                  />
                </div>

                {/* Password */}
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 bg-[#1A5C38] hover:bg-[#2E7D52] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99] mt-2 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Create my account'
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#D8E8DF]" />
                  <span className="text-xs text-[#8A8A8A] font-medium whitespace-nowrap">or continue with</span>
                  <div className="flex-1 h-px bg-[#D8E8DF]" />
                </div>

                {/* Telegram CTA */}
                <button
                  type="button"
                  onClick={handleTelegramAuth}
                  className="w-full py-3 border border-[#D8E8DF] hover:border-[#229ED9] hover:bg-[#F0F8FD] rounded-xl text-sm font-semibold text-[#1C1C1E] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <span className="w-5 h-5 bg-[#229ED9] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                    </svg>
                  </span>
                  Continue with Telegram Bot (@KaziAfrica_bot)
                </button>

                <p className="text-center text-xs text-[#8A8A8A] pt-2">
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

            {/* SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleSignin} className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1.5">Welcome back</h2>
                  <p className="text-sm text-[#8A8A8A]">Sign in to your Kazi account.</p>
                </div>

                {/* Role Selector Cards for Sign In */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div
                    onClick={() => setRole('worker')}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                      role === 'worker'
                        ? 'border-[#1A5C38] bg-[#E8F5EE]'
                        : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/50'
                    }`}
                  >
                    <span className="text-xl">👷</span>
                    <span className="text-xs font-bold text-[#1C1C1E]">Job Seeker</span>
                    <span className="text-[10px] text-[#8A8A8A]">Find Work</span>
                  </div>

                  <div
                    onClick={() => setRole('employer')}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                      role === 'employer'
                        ? 'border-[#1A5C38] bg-[#E8F5EE]'
                        : 'border-[#D8E8DF] hover:border-[#2E7D52] hover:bg-[#E8F5EE]/50'
                    }`}
                  >
                    <span className="text-xl">🏢</span>
                    <span className="text-xs font-bold text-[#1C1C1E]">Employer</span>
                    <span className="text-[10px] text-[#8A8A8A]">Hire Workers</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="ada@example.com"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#D8E8DF] rounded-xl text-sm text-[#1C1C1E] focus:outline-none focus:border-[#2E7D52] focus:ring-2 focus:ring-[#2E7D52]/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">Password</label>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent to your email.', 'success'); }} className="text-xs text-[#2E7D52] font-medium hover:underline">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 bg-[#1A5C38] hover:bg-[#2E7D52] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#D8E8DF]" />
                  <span className="text-xs text-[#8A8A8A] font-medium whitespace-nowrap">or continue with</span>
                  <div className="flex-1 h-px bg-[#D8E8DF]" />
                </div>

                <button
                  type="button"
                  onClick={handleTelegramAuth}
                  className="w-full py-3 border border-[#D8E8DF] hover:border-[#229ED9] hover:bg-[#F0F8FD] rounded-xl text-sm font-semibold text-[#1C1C1E] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <span className="w-5 h-5 bg-[#229ED9] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                    </svg>
                  </span>
                  Continue with Telegram Bot (@KaziAfrica_bot)
                </button>

                <p className="text-center text-xs text-[#8A8A8A] pt-2">
                  No account yet?{' '}
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

          </div>
        </div>
      </div>

      {/* Toast popup */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-xs font-semibold shadow-xl z-50 transition-all ${
          toastType === 'error'
            ? 'bg-red-600 text-white'
            : toastType === 'success'
            ? 'bg-[#1A5C38] text-white'
            : 'bg-[#1C1C1E] text-white'
        }`} style={{ animation: 'slideUp 0.3s ease-out' }}>
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
