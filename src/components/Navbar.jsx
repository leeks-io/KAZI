import React from 'react';
import { Menu, MessageSquare, LayoutDashboard, User, LogOut, Sparkles } from 'lucide-react';
import KaziLogo from './KaziLogo';

export default function Navbar({
  activeView,
  onSwitchView,
  onOpenMobileMenu,
  user = null,
  onLogout,
  applicationsCount = 0,
  savedCount = 0
}) {
  return (
    <header className="relative z-30 border-b border-gray-800/60 bg-[#0E0C22]/90 backdrop-blur-md">
      {/* Editorial Top Ticker / Masthead Metadata */}
      <div className="border-b border-gray-800/40 py-1.5 px-6 text-[10px] font-heading font-semibold uppercase tracking-widest text-[#F5F0E8]/50 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="text-[#E8632C] font-bold">KAZI EDITORIAL • ISSUE 2026</span>
          <span className="hidden sm:inline-block text-gray-600">|</span>
          <span className="hidden sm:inline-block">AFRICA'S INFORMAL ECONOMY NETWORK</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[#F2A03D]">
            <Sparkles className="w-3 h-3" /> VOICE & CV ENGINE LIVE
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Kazi Logo & Wordmark */}
        <KaziLogo
          size={36}
          onClick={() => onSwitchView('chat')}
        />

        {/* Editorial Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#191638] border border-gray-800/80">
          <button
            onClick={() => onSwitchView('chat')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeView === 'chat'
                ? 'bg-[#E8632C] text-white shadow-md'
                : 'text-[#F5F0E8]/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Match Engine
          </button>

          <button
            onClick={() => onSwitchView('dashboard')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-[#E8632C] text-white shadow-md'
                : 'text-[#F5F0E8]/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
            {(applicationsCount > 0 || savedCount > 0) && (
              <span className="w-4 h-4 rounded-full bg-[#F2A03D] text-[#12102A] text-[9px] font-extrabold flex items-center justify-center ml-0.5">
                {applicationsCount + savedCount}
              </span>
            )}
          </button>
        </div>

        {/* User Account State / Sign In Button */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSwitchView('dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#191638] border border-[#E8632C]/40 text-[#F5F0E8] text-xs font-heading font-bold uppercase hover:border-[#E8632C] transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-[#E8632C] text-white flex items-center justify-center text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-[#191638] border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSwitchView('login')}
              className={`inline-flex items-center gap-2 px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs ${
                activeView === 'login'
                  ? 'bg-[#F2A03D] text-[#12102A]'
                  : 'bg-[#E8632C] hover:bg-[#D2531F] text-white shadow-[#E8632C]/20'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          <button
            onClick={onOpenMobileMenu}
            aria-label="Toggle Menu"
            className="md:hidden w-10 h-10 rounded-xl bg-[#E8632C] flex items-center justify-center text-white hover:bg-[#D2531F] transition-colors shadow-md cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
