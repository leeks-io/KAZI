import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import WorkerDashboard from './components/WorkerDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import LoginPage from './components/LoginPage';
import { Globe, ShieldCheck } from 'lucide-react';

export default function App() {
  // Restore session from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kazi_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeView, setActiveView] = useState(() => {
    try {
      const savedView = localStorage.getItem('kazi_active_view');
      if (savedView) return savedView;
      const savedUser = localStorage.getItem('kazi_current_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard';
      }
    } catch (e) {}
    return 'login';
  });

  const [activeTab, setActiveTab] = useState('find_job'); // 'find_job' | 'post_job'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent User Data State across Chat & Dashboard
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [myPostings, setMyPostings] = useState([]);

  // Verify JWT token on mount if one exists
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('kazi_token');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('kazi_current_user', JSON.stringify(data.user));
        }
      } catch (err) {
        // Silently fail — user can still use cached data
        console.warn('Session verification failed:', err.message);
      }
    };

    verifySession();
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    const targetView = userObj.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard';
    setActiveView(targetView);
    try {
      localStorage.setItem('kazi_current_user', JSON.stringify(userObj));
      localStorage.setItem('kazi_active_view', targetView);
    } catch (e) {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kazi_current_user');
      localStorage.removeItem('kazi_active_view');
      localStorage.removeItem('kazi_token');
    } catch (e) {}
    setCurrentUser(null);
    setActiveView('login');
  };

  // Apply for a job
  const handleApplyJob = (job) => {
    if (!applications.some(a => a.id === job.id)) {
      setApplications(prev => [job, ...prev]);
    }
  };

  // Save / Bookmark a job
  const handleSaveJob = (job) => {
    if (savedJobs.some(s => s.id === job.id)) {
      setSavedJobs(prev => prev.filter(s => s.id !== job.id));
    } else {
      setSavedJobs(prev => [job, ...prev]);
    }
  };

  // Add a newly posted job
  const handleNewPosting = (job) => {
    if (!myPostings.some(p => p.id === job.id)) {
      setMyPostings(prev => [job, ...prev]);
    }
  };

  // 1. DEDICATED WORKER DASHBOARD (Strictly Worker / Job Seeker - No Employer content)
  if (activeView === 'worker-dashboard') {
    return (
      <WorkerDashboard
        user={currentUser || { name: 'Job Seeker', role: 'worker' }}
        onLogout={handleLogout}
        onSwitchToEmployer={() => {
          if (currentUser) {
            const empUser = { ...currentUser, role: 'employer' };
            setCurrentUser(empUser);
            setActiveView('employer-dashboard');
            try {
              localStorage.setItem('kazi_current_user', JSON.stringify(empUser));
              localStorage.setItem('kazi_active_view', 'employer-dashboard');
            } catch (e) {}
          }
        }}
        initialPage="dashboard"
        externalApplications={applications}
        externalSavedJobs={savedJobs}
        onApplyJob={handleApplyJob}
        onSaveJob={handleSaveJob}
      />
    );
  }

  // 2. DEDICATED EMPLOYER DASHBOARD (Strictly Employer / Hiring - No Worker finding work content)
  if (activeView === 'employer-dashboard') {
    return (
      <EmployerDashboard
        user={currentUser || { name: 'Employer', role: 'employer' }}
        onLogout={handleLogout}
        onSwitchToWorker={() => {
          if (currentUser) {
            const workerUser = { ...currentUser, role: 'worker' };
            setCurrentUser(workerUser);
            setActiveView('worker-dashboard');
            try {
              localStorage.setItem('kazi_current_user', JSON.stringify(workerUser));
              localStorage.setItem('kazi_active_view', 'worker-dashboard');
            } catch (e) {}
          }
        }}
        initialPage="empDash"
      />
    );
  }

  // 3. LOGIN / SIGNUP VIEW
  if (activeView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => {
          // Do nothing — user must authenticate
        }}
      />
    );
  }

  // 4. CLASSIC EDITORIAL / FALLBACK VIEW
  return (
    <div className="min-h-screen bg-[#0E0C22] text-[#F5F0E8] font-sans relative selection:bg-[#E8632C] selection:text-white">
      <Navbar
        activeView={activeView}
        onSwitchView={(v) => {
          if (v === 'dashboard') {
            setActiveView(currentUser?.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
          } else {
            setActiveView(v);
          }
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        user={currentUser}
        onLogout={handleLogout}
        applicationsCount={applications.length}
        savedCount={savedJobs.length}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        onSwitchView={(v) => {
          if (v === 'dashboard') {
            setActiveView(currentUser?.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
          } else {
            setActiveView(v);
          }
        }}
        user={currentUser}
        onLogout={handleLogout}
        applicationsCount={applications.length}
        savedCount={savedJobs.length}
      />

      {activeView === 'classic-chat' && (
        <Hero onStartChatting={() => {}} />
      )}

      <main className="relative z-10 pb-20">
        <ChatInterface
          activeTab={activeTab}
          onToggleTab={(tab) => setActiveTab(tab)}
          onApplyJob={handleApplyJob}
          onSaveJob={handleSaveJob}
          onNewPosting={handleNewPosting}
          applications={applications}
          savedJobs={savedJobs}
        />
      </main>

      <footer className="border-t border-gray-800/80 bg-[#080716] py-10 px-6 text-xs text-[#F5F0E8]/60 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-sm tracking-wider text-[#F5F0E8]">
              KAZI EDITORIAL PLATFORM
            </span>
          </div>

          <div className="flex items-center gap-6 text-[#F5F0E8]/70">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#F2A03D]" /> Nigeria • Kenya • Uganda • Ghana
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8632C]" /> SQLite & Gemini AI Powered
            </span>
          </div>

          <div>
            Kazi © {new Date().getFullYear()} — Voice-First Informal Economy Job Matching.
          </div>
        </div>
      </footer>
    </div>
  );
}
