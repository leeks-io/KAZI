import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, MessageSquare, LayoutDashboard, User, LogOut } from 'lucide-react';
import KaziLogo from './KaziLogo';

export default function MobileMenu({
  isOpen,
  onClose,
  activeView,
  onSwitchView,
  user = null,
  onLogout,
  applicationsCount = 0,
  savedCount = 0
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-[#0E0C22] flex flex-col justify-between p-6 md:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <KaziLogo size={36} onClick={onClose} />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-800 text-[#F5F0E8] flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Editorial Links */}
          <div className="flex flex-col gap-6 my-auto">
            <button
              onClick={() => {
                onSwitchView('chat');
                onClose();
              }}
              className={`flex items-center gap-3 text-left font-heading text-2xl font-bold uppercase transition-colors ${
                activeView === 'chat' ? 'text-[#E8632C]' : 'text-[#F5F0E8]'
              }`}
            >
              <MessageSquare className="w-6 h-6 text-[#E8632C]" />
              Match Engine
            </button>

            <button
              onClick={() => {
                onSwitchView('dashboard');
                onClose();
              }}
              className={`flex items-center justify-between text-left font-heading text-2xl font-bold uppercase transition-colors ${
                activeView === 'dashboard' ? 'text-[#E8632C]' : 'text-[#F5F0E8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-[#F2A03D]" />
                User Dashboard
              </div>
              {(applicationsCount > 0 || savedCount > 0) && (
                <span className="px-3 py-1 rounded-full bg-[#E8632C] text-white text-xs font-bold">
                  {applicationsCount + savedCount} New
                </span>
              )}
            </button>

            {user ? (
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-lg text-[#F5F0E8] uppercase">{user.name}</div>
                  <div className="text-xs text-[#F2A03D] font-sans">{user.role.toUpperCase()} • {user.contact}</div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#191638] border border-gray-800 text-gray-400"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSwitchView('login');
                  onClose();
                }}
                className={`flex items-center gap-3 text-left font-heading text-2xl font-bold uppercase transition-colors ${
                  activeView === 'login' ? 'text-[#F2A03D]' : 'text-[#F5F0E8]'
                }`}
              >
                <User className="w-6 h-6 text-[#F2A03D]" />
                Sign In / Register
              </button>
            )}
          </div>

          {/* CTA pinned to bottom in terracotta */}
          <div className="pt-6 border-t border-gray-800">
            <button
              onClick={() => {
                onSwitchView('chat');
                onClose();
              }}
              className="w-full py-4 bg-[#E8632C] hover:bg-[#D2531F] text-white font-heading font-bold text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-xl rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs"
            >
              Start Chatting Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
