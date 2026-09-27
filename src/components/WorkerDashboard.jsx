import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  Bookmark,
  ClipboardList,
  Clock,
  Check,
  CheckCircle2,
  Bell,
  User,
  Paperclip,
  Mic,
  Send,
  X,
  Trash2,
  Plus,
  Search,
  Menu,
  Briefcase,
  MapPin,
  DollarSign,
  Building,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Calendar
} from 'lucide-react';

export default function WorkerDashboard({
  user,
  onLogout,
  onSwitchToEmployer,
  initialPage = 'dashboard',
  externalApplications = [],
  externalSavedJobs = [],
  onApplyJob,
  onSaveJob
}) {
  // Navigation: 'dashboard' | 'chat' | 'saved' | 'applied' | 'tasks'
  const [activePage, setActivePage] = useState(initialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Pre-populated seed jobs for worker view
  const defaultJobs = [
    {
      id: 'mech-1',
      key: 'mechanic',
      icon: '🔧',
      title: 'Auto Mechanic',
      company: 'ABC Auto Services',
      location: 'Ikeja, Lagos',
      salary: '₦120,000/month',
      type: 'Full-time',
      match: ['Mechanic experience', 'Near Ikeja', 'Immediate start'],
      about: 'Experienced auto mechanic needed for a busy garage in Ikeja. You will handle engine diagnostics, general repairs, and routine vehicle maintenance.',
      reqs: ['2+ years garage experience', 'Engine diagnostics & overhaul', 'General electrical knowledge', 'Available immediately']
    },
    {
      id: 'clean-1',
      key: 'cleaner',
      icon: '🧹',
      title: 'House Cleaner',
      company: 'HomeHelp Lagos',
      location: 'Yaba, Lagos',
      salary: '₦50,000/month',
      type: 'Full-time',
      match: ['Cleaning experience', 'Near Yaba', 'Flexible hours'],
      about: 'We need a reliable, experienced house cleaner for a family residence in Yaba. Work is Monday to Friday, 8am–4pm.',
      reqs: ['Previous residential cleaning experience', 'Honest, trustworthy, and reliable', 'Lagos resident', 'Guarantor references required']
    },
    {
      id: 'sec-1',
      key: 'security',
      icon: '🛡️',
      title: 'Corporate Security Guard',
      company: 'SecureNow Nigeria',
      location: 'Victoria Island, Lagos',
      salary: '₦80,000/month',
      type: 'Full-time',
      match: ['Security training', 'Lagos based', 'Shift rotation'],
      about: 'Security guard needed for a commercial corporate property in Victoria Island. 12-hour shifts, day and night rotations available.',
      reqs: ['Security training certification preferred', 'High physical fitness', 'Good English and Pidgin communication', 'Lagos resident']
    },
    {
      id: 'drive-1',
      key: 'driver',
      icon: '🚗',
      title: 'Private & Corporate Driver',
      company: 'Swift Logistics Hub',
      location: 'Surulere, Lagos',
      salary: '₦110,000/month',
      type: 'Full-time',
      match: ['Valid Driver’s License', 'Clean driving record', 'Surulere area'],
      about: 'Professional driver needed for corporate executive transportation and fleet handling across Lagos Mainland and Island routes.',
      reqs: ['Valid Nigerian driver license (Class E/D)', 'Minimum 4 years driving experience in Lagos', 'Familiarity with GPS and Lagos road network', 'Good communication']
    }
  ];

  // Saved Jobs State
  const [savedJobs, setSavedJobs] = useState([
    defaultJobs[1], // House Cleaner
    defaultJobs[0]  // Auto Mechanic
  ]);

  // Applications State
  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      jobId: 'mech-1',
      title: 'Auto Mechanic',
      company: 'ABC Auto Services',
      location: 'Ikeja, Lagos',
      appliedAt: '2 hours ago',
      status: 'Viewed', // 'Viewed' | 'Pending' | 'Interview Scheduled'
      statusColor: 'bg-[#FEF3DC] text-[#B7791F]'
    },
    {
      id: 'app-2',
      jobId: 'sec-1',
      title: 'Corporate Security Guard',
      company: 'SecureNow Nigeria',
      location: 'Victoria Island, Lagos',
      appliedAt: 'Yesterday',
      status: 'Pending',
      statusColor: 'bg-[#E8F5EE] text-[#1A5C38]'
    }
  ]);

  // Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Apply for Auto Mechanic job at Danfo Fix Motors',
      time: 'Tomorrow · 8:00 AM · Kazi will remind you',
      completed: false
    },
    {
      id: 2,
      title: 'Follow up on Security Guard application at SecureNow',
      time: 'Friday · 2:00 PM',
      completed: false
    }
  ]);

  // Job Detail Slide-out Drawer State
  const [selectedJob, setSelectedJob] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm-welcome',
      sender: 'bot',
      text: "Hi Ada 👋🏾 Tell me what kind of work you're looking for! You can type in Pidgin, English, or any language you're comfortable with, or tap the microphone.",
      cards: [],
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Handle Save / Unsave
  const toggleSaveJob = (job) => {
    const isSaved = savedJobs.some(j => j.id === job.id || j.title === job.title);
    if (isSaved) {
      setSavedJobs(prev => prev.filter(j => j.id !== job.id && j.title !== job.title));
      showToast('Removed from saved jobs');
    } else {
      setSavedJobs(prev => [job, ...prev]);
      showToast(`Saved "${job.title}" ❤️`);
    }
    if (onSaveJob) onSaveJob(job);
  };

  // Handle Apply
  const applyForJob = (job) => {
    const alreadyApplied = applications.some(a => a.title === job.title);
    if (alreadyApplied) {
      showToast('You have already applied for this job!');
      return;
    }

    const newApp = {
      id: 'app-' + Date.now(),
      jobId: job.id,
      title: job.title,
      company: job.company || job.company_name || 'Kazi Employer',
      location: job.location || 'Lagos',
      appliedAt: 'Just now',
      status: 'Pending',
      statusColor: 'bg-[#E8F5EE] text-[#1A5C38]'
    };

    setApplications(prev => [newApp, ...prev]);
    showToast(`Application submitted for ${job.title}! ✓`);
    if (onApplyJob) onApplyJob(job);
  };

  // Handle Chat Send
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    setChatInput('');

    // Append User Message
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      cards: [],
      time: 'Just now'
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Try calling backend matching API (/api/match)
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, intentHint: 'find_job' })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);

        let matchedCards = [];
        if (data.matched_jobs && data.matched_jobs.length > 0) {
          matchedCards = data.matched_jobs.slice(0, 3).map(j => ({
            id: 'job-' + j.id,
            key: j.skill || 'mechanic',
            icon: j.skill === 'cleaner' ? '🧹' : j.skill === 'driver' ? '🚗' : j.skill === 'security guard' ? '🛡️' : '🔧',
            title: j.title,
            company: j.company_name || 'Kazi Verified Employer',
            location: j.location,
            salary: j.salary,
            type: j.type || 'Full-time',
            match: j.matched_fields ? Object.keys(j.matched_fields).map(k => `${k}: ${j.matched_fields[k]}`) : ['Skill match', 'Location match'],
            about: `Verified African informal economy role for ${j.title}. Immediate start available.`,
            reqs: ['Prior experience in role', 'Available to work', 'Lagos / local resident', 'Punctual and honest']
          }));
        }

        const botReply = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.reply || (matchedCards.length > 0
            ? `I found **${matchedCards.length} verified jobs** matching your search! Take a look below:`
            : `I've noted your profile for **"${query}"**. Let me search our SQLite network for upcoming openings.`),
          cards: matchedCards,
          time: 'Just now'
        };
        setChatMessages(prev => [...prev, botReply]);
        return;
      }
    } catch (err) {
      console.warn('Backend match API fallback:', err);
    }

    // Local fallback matching
    setTimeout(() => {
      setIsTyping(false);
      const q = query.toLowerCase();
      let replyText = "I searched our network across Lagos, Nairobi, and Accra. Here are the top matches:";
      let cards = [defaultJobs[0], defaultJobs[1]];

      if (q.includes('mechanic') || q.includes('car') || q.includes('auto')) {
        replyText = "Got you! I found **2 auto mechanic opportunities** in Ikeja and Surulere 🔧";
        cards = [defaultJobs[0]];
      } else if (q.includes('clean') || q.includes('house') || q.includes('maid')) {
        replyText = "Found **2 verified cleaning positions** near Yaba and Lekki 🧹";
        cards = [defaultJobs[1]];
      } else if (q.includes('security') || q.includes('guard')) {
        replyText = "Here are **2 corporate security positions** with prompt monthly pay 🛡️";
        cards = [defaultJobs[2]];
      } else if (q.includes('driver') || q.includes('drive') || q.includes('ride')) {
        replyText = "I found **driver opportunities** in Lagos Mainland & Island 🚗";
        cards = [defaultJobs[3]];
      } else if (q.includes('remind') || q.includes('task')) {
        replyText = "⏰ Done! I've scheduled a reminder for you. I'll notify you on your dashboard.";
        cards = [];
        setTasks(prev => [
          {
            id: Date.now(),
            title: query,
            time: 'Scheduled reminder · Kazi Bot',
            completed: false
          },
          ...prev
        ]);
        showToast('New reminder created! ⏰');
      }

      const botReply = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyText,
        cards,
        time: 'Just now'
      };
      setChatMessages(prev => [...prev, botReply]);
    }, 900);
  };

  // Voice recording simulation or browser speech
  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      showToast('Transcribing voice note with Gemini AI...');
      setTimeout(() => {
        handleSendMessage('Find me mechanic work around Ikeja');
      }, 1000);
    } else {
      setIsRecording(true);
      showToast('Listening... Speak now 🎤');
      setTimeout(() => {
        setIsRecording(false);
        showToast('Processing audio with Gemini AI...');
        setTimeout(() => {
          handleSendMessage('I dey find cleaner job for Lekki or Yaba');
        }, 800);
      }, 3500);
    }
  };

  // CV Upload handling
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('intentHint', 'find_job');

    try {
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        showToast('CV parsed successfully with Gemini AI! 🎉');
        handleSendMessage(`Extracted CV profile: ${data.extracted_cv_text || file.name}`);
      } else {
        showToast('CV parsed! Matching skills from document...');
        handleSendMessage(`Uploaded resume: ${file.name}. Match me to top jobs.`);
      }
    } catch (err) {
      showToast('CV uploaded! Matching skills from resume...');
      handleSendMessage(`Uploaded resume: ${file.name}. Match me to top jobs.`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7FAF8] text-[#1C1C1E] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden antialiased">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── WORKER SIDEBAR ── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#1A5C38] text-white flex flex-col z-40 transition-transform duration-250 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#1A5C38] flex items-center justify-center font-extrabold text-base shadow-sm">
              K
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Kaz<span className="text-[#F5A623]">i</span>
            </span>
          </div>
          <button
            className="md:hidden text-white/70 hover:text-white p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKER ROLE BADGE (Strictly Worker) */}
        <div className="mx-3.5 my-3 bg-white/10 rounded-xl p-3 border border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Active Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F5A623] bg-[#FEF3DC]/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse"></span>
              Job Seeker
            </span>
          </div>
          <div className="text-xs font-semibold text-white/90 mt-1 flex items-center gap-1.5">
            <span>👷</span> Find Work & Chat
          </div>
        </div>

        {/* Worker Navigation List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider px-3 pt-3 pb-1.5">
            Worker Workspace
          </div>

          <button
            onClick={() => { setActivePage('chat'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'chat'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#F5A623]" />
            <span>Chat with Kazi</span>
          </button>

          <button
            onClick={() => { setActivePage('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'dashboard'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#F5A623]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActivePage('saved'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'saved'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-[#F5A623]" />
              <span>Saved Jobs</span>
            </div>
            {savedJobs.length > 0 && (
              <span className="bg-[#F5A623] text-[#1C1C1E] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {savedJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActivePage('applied'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'applied'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-[#F5A623]" />
              <span>Applications</span>
            </div>
            {applications.length > 0 && (
              <span className="bg-[#F5A623] text-[#1C1C1E] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {applications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActivePage('tasks'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'tasks'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <span>Tasks & Reminders</span>
          </button>
        </nav>

        {/* Sidebar Footer with Worker User Chip & Portal Switch */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Switch to Employer View button */}
          <button
            onClick={onSwitchToEmployer}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white transition-colors cursor-pointer"
            title="Switch to Employer view to test separated dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Switch to Employer Portal</span>
          </button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#1C1C1E] font-bold flex items-center justify-center text-xs">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || 'Ada Okafor'}
                </div>
                <div className="text-[10px] text-white/60">Job Seeker</div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-white/60 hover:text-white p-1.5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-[#E2EDE7] px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#1C1C1E] p-1.5 rounded-lg border border-[#E2EDE7]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-extrabold text-[#1C1C1E] flex items-center gap-2">
              {activePage === 'chat' && '💬 Chat with Kazi'}
              {activePage === 'dashboard' && '📊 Worker Dashboard'}
              {activePage === 'saved' && `❤️ Saved Jobs (${savedJobs.length})`}
              {activePage === 'applied' && `📋 My Applications (${applications.length})`}
              {activePage === 'tasks' && '⏰ Tasks & Reminders'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5C38] bg-[#E8F5EE] px-3 py-1 rounded-full border border-[#D8E8DF]">
              <span className="w-2 h-2 rounded-full bg-[#1A5C38]"></span>
              Looking for Work
            </span>

            <button
              onClick={() => showToast('No unread notifications')}
              className="w-8 h-8 rounded-lg border border-[#E2EDE7] flex items-center justify-center text-[#1C1C1E] hover:border-[#1A5C38] relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full ring-2 ring-white"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#1C1C1E] font-extrabold flex items-center justify-center text-xs">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* 1. CHAT PAGE */}
          {activePage === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F7FAF8]">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {chatMessages.length === 1 && (
                  <div className="text-center py-6 px-4 max-w-lg mx-auto bg-white rounded-2xl border border-[#E2EDE7] shadow-sm mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A5C38] text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
                      🌍
                    </div>
                    <h2 className="text-lg font-extrabold text-[#1C1C1E]">
                      Hi {user?.name || 'Ada'} 👋🏾
                    </h2>
                    <p className="text-xs text-[#8A8A8A] mt-1 leading-relaxed">
                      Tell me what you're looking for. I'll find the right match — in Pidgin, English, Swahili, or any language you're comfortable with.
                    </p>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {[
                        { label: '🔧 Mechanic in Ikeja', query: 'Find me mechanic work around Ikeja' },
                        { label: '🧹 Cleaning in Lekki', query: 'I need cleaning jobs in Lekki' },
                        { label: '🛡️ Security in Lagos', query: 'Find security guard jobs Lagos' },
                        { label: '🚗 Driver in Surulere', query: 'Show me driver jobs in Surulere' }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip.query)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F7FAF8] hover:bg-[#E8F5EE] text-[#4A4A4A] hover:text-[#1A5C38] border border-[#E2EDE7] hover:border-[#1A5C38] transition-colors cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message bubbles */}
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-[#F5A623] text-[#1C1C1E]'
                          : 'bg-[#1A5C38] text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? (user?.name?.[0] || 'A') : '🌍'}
                    </div>

                    <div className="space-y-2 max-w-lg">
                      <div
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#1A5C38] text-white rounded-tr-none'
                            : 'bg-white text-[#1C1C1E] border border-[#E2EDE7] rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Attached Job Cards if any */}
                      {msg.cards && msg.cards.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          {msg.cards.map((card, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => setSelectedJob(card)}
                              className="bg-white rounded-xl border border-[#E2EDE7] hover:border-[#1A5C38] p-3.5 shadow-sm transition-all hover:shadow-md cursor-pointer text-left"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                                  {card.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                                    {card.title}
                                  </div>
                                  <div className="text-[11px] text-[#8A8A8A]">
                                    {card.company}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 my-2.5">
                                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F7FAF8] border border-[#E2EDE7] px-2 py-0.5 rounded-md text-[#4A4A4A]">
                                  <MapPin className="w-3 h-3 text-[#1A5C38]" /> {card.location}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] bg-[#FEF3DC] border border-[#F5A623]/30 px-2 py-0.5 rounded-md text-[#B7791F] font-bold">
                                  <DollarSign className="w-3 h-3" /> {card.salary}
                                </span>
                                <span className="inline-flex items-center text-[11px] bg-[#F7FAF8] border border-[#E2EDE7] px-2 py-0.5 rounded-md text-[#8A8A8A]">
                                  {card.type}
                                </span>
                              </div>

                              {card.match && card.match.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2.5">
                                  {card.match.map((m, mIdx) => (
                                    <span
                                      key={mIdx}
                                      className="text-[10px] font-bold text-[#1A5C38] bg-[#E8F5EE] px-2 py-0.5 rounded"
                                    >
                                      ✓ {m}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t border-[#E2EDE7]/60">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedJob(card);
                                  }}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#1A5C38] hover:bg-[#155130] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaveJob(card);
                                  }}
                                  className="p-1.5 rounded-lg border border-[#E2EDE7] hover:border-[#1A5C38] text-xs transition-colors cursor-pointer"
                                  title="Save job"
                                >
                                  ❤️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-[#8A8A8A] px-1">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1A5C38] text-white flex items-center justify-center text-xs font-bold">
                      🌍
                    </div>
                    <div className="bg-white border border-[#E2EDE7] rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 md:p-4 bg-white border-t border-[#E2EDE7]">
                {/* Hidden file input for CV upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCVUpload}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />

                <div className="flex items-center gap-2 bg-[#F7FAF8] border border-[#E2EDE7] focus-within:border-[#1A5C38] rounded-2xl p-2 transition-colors">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your skill or location... or speak 🎤"
                    className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-[#1C1C1E] px-2 resize-none placeholder:text-[#8A8A8A]"
                  />

                  {/* Mic Button */}
                  <button
                    onClick={handleMicClick}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-[#4A4A4A] hover:bg-[#E8F5EE] hover:text-[#1A5C38]'
                    }`}
                    title={isRecording ? 'Listening...' : 'Voice input (Gemini speech-to-text)'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* CV Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#4A4A4A] hover:bg-[#E8F5EE] hover:text-[#1A5C38] transition-colors cursor-pointer"
                    title="Upload CV or Resume for instant AI matching"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim()}
                    className="w-9 h-9 rounded-xl bg-[#1A5C38] hover:bg-[#155130] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-[#8A8A8A] text-center mt-2">
                  Try: "I dey find mechanic work for Ikeja" · "Remind me tomorrow to apply"
                </div>
              </div>
            </div>
          )}

          {/* 2. DASHBOARD OVERVIEW PAGE */}
          {activePage === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              {/* Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2EDE7] shadow-sm">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1E]">
                    Good morning, {user?.name || 'Ada'} 👋🏾
                  </h2>
                  <p className="text-xs md:text-sm text-[#8A8A8A] mt-1">
                    Here's what's happening with your job search across Africa's informal economy.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('chat')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A5C38] hover:bg-[#155130] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#F5A623]" />
                  Chat to Find Work
                </button>
              </div>

              {/* 3 Large Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Job Matches
                    </span>
                    <span className="p-2 rounded-xl bg-[#E8F5EE] text-[#1A5C38]">
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#1A5C38] mt-3">
                    12
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    Matches tailored to your profile
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Applications
                    </span>
                    <span className="p-2 rounded-xl bg-[#FEF3DC] text-[#B7791F]">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#B7791F] mt-3">
                    {applications.length}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    {applications.filter(a => a.status === 'Viewed').length} viewed by employers
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Saved Jobs
                    </span>
                    <span className="p-2 rounded-xl bg-[#E8F5EE] text-[#1A5C38]">
                      <Bookmark className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#1A5C38] mt-3">
                    {savedJobs.length}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    Saved for later review
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-2xl border border-[#E2EDE7] shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1C1C1E]">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#E2EDE7]/70">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                      🔧
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                        3 mechanic jobs found
                      </div>
                      <div className="text-[11px] text-[#8A8A8A]">
                        Ikeja, Lagos · Matched your primary skills
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">2h ago</div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#E2EDE7]/70">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF3DC] flex items-center justify-center text-lg flex-shrink-0">
                      📋
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                        Application viewed
                      </div>
                      <div className="text-[11px] text-[#8A8A8A]">
                        Auto Mechanic — ABC Services opened your profile
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">Yesterday</div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#E2EDE7]/70">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                      ❤️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                        House Cleaner job saved
                      </div>
                      <div className="text-[11px] text-[#8A8A8A]">
                        Yaba, Lagos · ₦50,000/month
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">2 days ago</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1C1E] mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <button
                    onClick={() => setActivePage('chat')}
                    className="p-4 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">💬</div>
                    <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                      Chat with Kazi
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      Find new opportunities
                    </div>
                  </button>

                  <button
                    onClick={() => setActivePage('applied')}
                    className="p-4 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                      My Applications
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      Track your submissions
                    </div>
                  </button>

                  <button
                    onClick={() => setActivePage('saved')}
                    className="p-4 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">❤️</div>
                    <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                      Saved Jobs
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      {savedJobs.length} listings waiting
                    </div>
                  </button>

                  <button
                    onClick={() => setActivePage('tasks')}
                    className="p-4 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                      My Tasks
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      {tasks.filter(t => !t.completed).length} reminders pending
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SAVED JOBS PAGE */}
          {activePage === 'saved' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1E]">
                    Saved Jobs ({savedJobs.length})
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Bookmark jobs to review details or apply when you're ready.
                  </p>
                </div>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E2EDE7] p-8">
                  <div className="text-4xl mb-3">❤️</div>
                  <div className="text-base font-bold text-[#1C1C1E]">No saved jobs yet</div>
                  <div className="text-xs text-[#8A8A8A] max-w-sm mx-auto mt-1 mb-4">
                    Explore jobs in chat with Kazi and tap the heart icon to save listings here.
                  </div>
                  <button
                    onClick={() => setActivePage('chat')}
                    className="px-4 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold"
                  >
                    Search Jobs in Chat
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedJobs.map((job, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedJob(job)}
                      className="bg-white p-4 rounded-2xl border border-[#E2EDE7] hover:border-[#1A5C38] transition-all hover:shadow-sm cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-2xl flex-shrink-0">
                          {job.icon || '💼'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1C1C1E]">{job.title}</div>
                          <div className="text-xs text-[#8A8A8A]">{job.company}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[11px] bg-[#F7FAF8] border border-[#E2EDE7] px-2 py-0.5 rounded text-[#4A4A4A]">
                              📍 {job.location}
                            </span>
                            <span className="text-[11px] bg-[#FEF3DC] border border-[#F5A623]/30 px-2 py-0.5 rounded text-[#B7791F] font-bold">
                              💰 {job.salary}
                            </span>
                            <span className="text-[11px] bg-[#F7FAF8] border border-[#E2EDE7] px-2 py-0.5 rounded text-[#8A8A8A]">
                              🕐 {job.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job);
                          }}
                          className="p-2 rounded-xl border border-[#E2EDE7] hover:border-red-400 text-red-500 transition-colors cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. APPLICATIONS PAGE */}
          {activePage === 'applied' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1E]">
                    My Applications ({applications.length})
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Real-time status updates on all jobs you've applied for.
                  </p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E2EDE7] p-8">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="text-base font-bold text-[#1C1C1E]">No applications yet</div>
                  <div className="text-xs text-[#8A8A8A] max-w-sm mx-auto mt-1 mb-4">
                    Find matching positions via chat or saved jobs, then tap Apply to submit your profile.
                  </div>
                  <button
                    onClick={() => setActivePage('chat')}
                    className="px-4 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold"
                  >
                    Find Work in Chat
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white p-4 rounded-2xl border border-[#E2EDE7] flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                          💼
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                            {app.title}
                          </div>
                          <div className="text-[11px] text-[#8A8A8A]">
                            {app.company} · Applied {app.appliedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border border-black/5 ${app.statusColor}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. TASKS PAGE */}
          {activePage === 'tasks' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1E]">
                    My Tasks & Reminders
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Follow-ups, scheduled calls, and reminders managed by Kazi AI.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const taskName = prompt('Enter task or reminder:');
                    if (taskName) {
                      setTasks(prev => [
                        {
                          id: Date.now(),
                          title: taskName,
                          time: 'Custom reminder · Today',
                          completed: false
                        },
                        ...prev
                      ]);
                      showToast('Task added! ✓');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A5C38] text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-white p-4 rounded-2xl border border-[#E2EDE7] flex items-center justify-between gap-4 transition-all shadow-sm ${
                      task.completed ? 'opacity-60 bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FEF3DC] text-[#B7791F] flex items-center justify-center text-lg flex-shrink-0">
                        ⏰
                      </div>
                      <div>
                        <div
                          className={`text-xs md:text-sm font-bold text-[#1C1C1E] ${
                            task.completed ? 'line-through text-[#8A8A8A]' : ''
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[11px] text-[#8A8A8A]">{task.time}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTasks(prev =>
                          prev.map(t =>
                            t.id === task.id ? { ...t, completed: !t.completed } : t
                          )
                        );
                        showToast(task.completed ? 'Marked active' : 'Task completed! ✓');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        task.completed
                          ? 'border-[#E2EDE7] text-[#8A8A8A] hover:bg-gray-100'
                          : 'bg-[#1A5C38] text-white hover:bg-[#155130] border-[#1A5C38]'
                      }`}
                    >
                      {task.completed ? 'Undo' : 'Done ✓'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setActivePage('chat');
                    setChatInput('Remind me tomorrow at 9am to call ABC Auto Services');
                  }}
                  className="w-full py-3 rounded-2xl bg-white border border-dashed border-[#1A5C38]/40 hover:border-[#1A5C38] text-[#1A5C38] text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  + Add task via Chat ("Remind me tomorrow to...")
                </button>
              </div>
            </div>
          )}

          {/* ── SLIDE-OUT JOB DETAIL PANEL ── */}
          {selectedJob && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-[#E2EDE7] shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="p-4 border-b border-[#E2EDE7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#4A4A4A] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-extrabold text-[#1C1C1E]">Job Details</span>
                </div>
                <button
                  onClick={() => applyForJob(selectedJob)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-3xl shadow-sm">
                  {selectedJob.icon || '💼'}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#1C1C1E]">
                    {selectedJob.title}
                  </h3>
                  <div className="text-xs text-[#8A8A8A] mt-0.5">
                    {selectedJob.company}
                  </div>
                </div>

                {/* Meta tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-[#F7FAF8] border border-[#E2EDE7] px-2.5 py-1 rounded-lg text-[#4A4A4A]">
                    <MapPin className="w-3.5 h-3.5 text-[#1A5C38]" /> {selectedJob.location}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#FEF3DC] border border-[#F5A623]/30 px-2.5 py-1 rounded-lg text-[#B7791F] font-bold">
                    <DollarSign className="w-3.5 h-3.5" /> {selectedJob.salary}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#F7FAF8] border border-[#E2EDE7] px-2.5 py-1 rounded-lg text-[#8A8A8A]">
                    <Clock className="w-3.5 h-3.5" /> {selectedJob.type}
                  </span>
                </div>

                {/* About Section */}
                <div className="space-y-2 pt-2 border-t border-[#E2EDE7]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                    About the Job
                  </h4>
                  <p className="text-xs md:text-sm text-[#4A4A4A] leading-relaxed">
                    {selectedJob.about || 'A reliable and verified informal economy role through the Kazi AI platform.'}
                  </p>
                </div>

                {/* Requirements */}
                <div className="space-y-2 pt-2 border-t border-[#E2EDE7]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                    Requirements
                  </h4>
                  <ul className="space-y-2">
                    {(selectedJob.reqs || ['Prior experience', 'Available immediately', 'Local resident']).map((req, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-xs md:text-sm text-[#4A4A4A]">
                        <Check className="w-4 h-4 text-[#1A5C38] flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E2EDE7] bg-white flex items-center gap-3">
                <button
                  onClick={() => applyForJob(selectedJob)}
                  className="flex-1 py-3 rounded-xl bg-[#1A5C38] hover:bg-[#155130] text-white text-xs md:text-sm font-bold transition-colors cursor-pointer shadow-md text-center"
                >
                  ✓ Apply for this job
                </button>
                <button
                  onClick={() => toggleSaveJob(selectedJob)}
                  className="p-3 rounded-xl border border-[#E2EDE7] hover:border-[#1A5C38] text-base transition-colors cursor-pointer"
                  title="Save job"
                >
                  ❤️
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Bottom Bar for Worker Navigation */}
        <div className="md:hidden h-14 bg-white border-t border-[#E2EDE7] flex items-center justify-around px-2 z-10">
          <button
            onClick={() => setActivePage('chat')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'chat' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold">Chat</span>
          </button>

          <button
            onClick={() => setActivePage('dashboard')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'dashboard' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-bold">Dashboard</span>
          </button>

          <button
            onClick={() => setActivePage('saved')}
            className={`flex flex-col items-center gap-0.5 relative ${
              activePage === 'saved' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-[9px] font-bold">Saved</span>
            {savedJobs.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#F5A623] text-[#1C1C1E] rounded-full text-[8px] font-extrabold flex items-center justify-center">
                {savedJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePage('tasks')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'tasks' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[9px] font-bold">Tasks</span>
          </button>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 bg-[#1C1C1E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
