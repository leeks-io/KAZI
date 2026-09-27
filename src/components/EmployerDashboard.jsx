import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Briefcase,
  Check,
  CheckCircle2,
  Bell,
  User,
  Mic,
  Send,
  X,
  Search,
  Menu,
  MapPin,
  DollarSign,
  Building,
  LogOut,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function EmployerDashboard({
  user,
  onLogout,
  onSwitchToWorker,
  initialPage = 'empDash'
}) {
  // Navigation: 'empDash' | 'hirechat' | 'applicants' | 'postings'
  const [activePage, setActivePage] = useState(initialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Active Job Postings for Employer
  const [jobs, setJobs] = useState([
    {
      id: 'emp-j1',
      title: 'House Cleaner',
      skill: 'cleaner',
      location: 'Lekki Phase 1, Lagos',
      salary: '₦50,000/month',
      type: 'Full-time',
      applicantsCount: 18,
      newApplicantsCount: 6,
      status: 'active', // 'active' | 'paused'
      postedDate: '3 days ago'
    },
    {
      id: 'emp-j2',
      title: 'Experienced Auto Mechanic',
      skill: 'mechanic',
      location: 'Ikeja, Lagos',
      salary: '₦120,000/month',
      type: 'Full-time',
      applicantsCount: 9,
      newApplicantsCount: 2,
      status: 'active',
      postedDate: '5 days ago'
    },
    {
      id: 'emp-j3',
      title: 'Day & Night Security Guard',
      skill: 'security guard',
      location: 'Victoria Island, Lagos',
      salary: '₦80,000/month',
      type: 'Full-time',
      applicantsCount: 4,
      newApplicantsCount: 1,
      status: 'active',
      postedDate: '1 week ago'
    }
  ]);

  // Applicants Database State
  const [applicants, setApplicants] = useState([
    {
      id: 'app-1',
      name: 'Amina Hassan',
      role: 'House Cleaner',
      jobId: 'emp-j1',
      location: 'Lekki Area, Lagos',
      experience: '3 years experience',
      matchRating: 'Strong', // 'Strong' | 'Good'
      matchRatingScore: '94%',
      matches: ['Cleaning experience', 'Lekki resident', 'Available immediately'],
      phone: '+234 803 123 4567',
      email: 'amina.hassan@example.com',
      bio: 'Punctual, thorough residential cleaner with 3 years experience working with families in Lekki and Ikoyi. Skilled in deep kitchen sanitation, laundry, and organization.',
      verified: true,
      shortlisted: false,
      appliedAt: '2 hours ago'
    },
    {
      id: 'app-2',
      name: 'Bisi Adeleke',
      role: 'House Cleaner',
      jobId: 'emp-j1',
      location: 'Near Lekki, Lagos',
      experience: '1 year experience',
      matchRating: 'Good',
      matchRatingScore: '82%',
      matches: ['Cleaning experience', 'Near Lekki'],
      phone: '+234 812 987 6543',
      email: 'bisi.adeleke@example.com',
      bio: 'Enthusiastic and reliable house cleaner. Strong references from previous residential employers on the Island.',
      verified: true,
      shortlisted: false,
      appliedAt: 'Yesterday'
    },
    {
      id: 'app-3',
      name: 'Chidi Eze',
      role: 'Experienced Auto Mechanic',
      jobId: 'emp-j2',
      location: 'Ikeja, Lagos',
      experience: '5 years experience',
      matchRating: 'Strong',
      matchRatingScore: '96%',
      matches: ['Engine diagnostics', 'Transmission specialist', 'Ikeja local'],
      phone: '+234 802 456 7890',
      email: 'chidi.mechanic@example.com',
      bio: 'Master mechanic trained in Japanese and German vehicles. Expertise in computer diagnostics, brake systems, and full engine overhauls.',
      verified: true,
      shortlisted: true,
      appliedAt: '1 day ago'
    },
    {
      id: 'app-4',
      name: 'Samuel Osei',
      role: 'Day & Night Security Guard',
      jobId: 'emp-j3',
      location: 'Victoria Island, Lagos',
      experience: '4 years experience',
      matchRating: 'Strong',
      matchRatingScore: '91%',
      matches: ['Certified guard training', 'CCTV monitoring', 'VI resident'],
      phone: '+234 818 345 6789',
      email: 'samuel.security@example.com',
      bio: 'Certified security officer with experience safeguarding bank branches and commercial compounds. Alert, physically fit, and trained in conflict de-escalation.',
      verified: true,
      shortlisted: false,
      appliedAt: '3 days ago'
    }
  ]);

  // Selected candidate for modal detail view
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Selected filter for applicants
  const [applicantFilter, setApplicantFilter] = useState('all');

  // Hire Chat State
  const [hireChatMessages, setHireChatMessages] = useState([
    {
      id: 'hm-1',
      sender: 'bot',
      text: "Hi Ada 👋🏾 Tell me who you need to hire. Speak naturally — I'll automatically parse the role, skills, location, and salary to generate the job posting for you.",
      postingDraft: null,
      time: 'Just now'
    }
  ]);
  const [hireInput, setHireInput] = useState('');
  const [isHireTyping, setIsHireTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const hireBottomRef = useRef(null);

  useEffect(() => {
    hireBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hireChatMessages, isHireTyping]);

  // Handle Post Job Chat Message
  const handleSendHireMessage = async (textToSend) => {
    const query = (textToSend || hireInput).trim();
    if (!query) return;

    setHireInput('');

    // Append user message
    const userMsg = {
      id: 'h-usr-' + Date.now(),
      sender: 'user',
      text: query,
      postingDraft: null,
      time: 'Just now'
    };
    setHireChatMessages(prev => [...prev, userMsg]);
    setIsHireTyping(true);

    // Call shared match API if available
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, intentHint: 'post_job' })
      });

      if (response.ok) {
        const data = await response.json();
        setIsHireTyping(false);

        const extracted = data.extracted || {};
        const draft = {
          title: extracted.title || 'Informal Job Vacancy',
          skill: extracted.skill && extracted.skill !== 'general' ? extracted.skill : 'general',
          location: extracted.location && extracted.location !== 'any' ? extracted.location : 'Lekki, Lagos',
          salary: extracted.salary || 'Negotiable',
          company: user?.name || 'Kazi Employer',
          type: extracted.type || 'Full-time'
        };

        const botMsg = {
          id: 'h-bot-' + Date.now(),
          sender: 'bot',
          text: `Got it! Here is what I understood 📋`,
          postingDraft: draft,
          time: 'Just now'
        };
        setHireChatMessages(prev => [...prev, botMsg]);
        return;
      }
    } catch (err) {
      console.warn('API fallback in hire chat:', err);
    }

    // Local extraction fallback
    setTimeout(() => {
      setIsHireTyping(false);
      const q = query.toLowerCase();
      let role = 'Field Worker';
      let loc = 'Lekki Phase 1, Lagos';
      let pay = '₦60,000/month';
      let skill = 'general';

      if (q.includes('clean')) {
        role = 'Residential & Office Cleaner';
        skill = 'cleaner';
        pay = '₦50,000/month';
      } else if (q.includes('mechanic')) {
        role = 'Automotive Mechanic Technician';
        skill = 'mechanic';
        pay = '₦120,000/month';
      } else if (q.includes('security') || q.includes('guard')) {
        role = 'Facility Security Guard';
        skill = 'security guard';
        pay = '₦80,000/month';
      } else if (q.includes('driver')) {
        role = 'Executive Dispatch Driver';
        skill = 'driver';
        pay = '₦100,000/month';
      }

      if (q.includes('ikeja')) loc = 'Ikeja, Lagos';
      if (q.includes('yaba')) loc = 'Yaba, Lagos';
      if (q.includes('nairobi')) loc = 'Westlands, Nairobi';
      if (q.includes('accra')) loc = 'Accra, Ghana';

      const salaryMatch = query.match(/₦[\d,]+|KSh[\d,]+|GH₵[\d,]+/i);
      if (salaryMatch) pay = salaryMatch[0] + '/month';

      const draft = {
        title: role,
        skill,
        location: loc,
        salary: pay,
        company: user?.name || 'Kazi Employer',
        type: 'Full-time'
      };

      const botMsg = {
        id: 'h-bot-' + Date.now(),
        sender: 'bot',
        text: `Got it! Here is what I understood 📋`,
        postingDraft: draft,
        time: 'Just now'
      };
      setHireChatMessages(prev => [...prev, botMsg]);
    }, 900);
  };

  // Confirm and publish posting
  const handleConfirmPosting = (draft) => {
    const newJob = {
      id: 'emp-j-' + Date.now(),
      title: draft.title,
      skill: draft.skill,
      location: draft.location,
      salary: draft.salary,
      type: draft.type,
      applicantsCount: 0,
      newApplicantsCount: 0,
      status: 'active',
      postedDate: 'Just now'
    };

    setJobs(prev => [newJob, ...prev]);
    showToast(`Job "${draft.title}" posted successfully! ✓ Workers will be notified.`);

    // Append confirmation reply to chat
    setHireChatMessages(prev => [
      ...prev,
      {
        id: 'h-bot-confirm-' + Date.now(),
        sender: 'bot',
        text: `🎉 Your job posting for **${draft.title}** in **${draft.location}** is now LIVE on Kazi! Workers in the area are receiving notifications on Telegram and Web.`,
        postingDraft: null,
        time: 'Just now'
      }
    ]);
  };

  // Toggle Shortlist
  const toggleShortlist = (candidateId) => {
    setApplicants(prev =>
      prev.map(c =>
        c.id === candidateId ? { ...c, shortlisted: !c.shortlisted } : c
      )
    );
    showToast('Candidate shortlist status updated! 📋');
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter(app => {
    if (applicantFilter === 'all') return true;
    if (applicantFilter === 'shortlisted') return app.shortlisted;
    return app.jobId === applicantFilter;
  });

  return (
    <div className="flex h-screen bg-[#F7FAF8] text-[#1C1C1E] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden antialiased">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── EMPLOYER SIDEBAR ── */}
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

        {/* EMPLOYER ROLE BADGE (Strictly Employer) */}
        <div className="mx-3.5 my-3 bg-white/10 rounded-xl p-3 border border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Active Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F5A623] bg-[#FEF3DC]/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse"></span>
              Hiring Manager
            </span>
          </div>
          <div className="text-xs font-semibold text-white/90 mt-1 flex items-center gap-1.5">
            <span>🏢</span> Employer & Recruiter View
          </div>
        </div>

        {/* Employer Navigation List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider px-3 pt-3 pb-1.5">
            Hiring Center
          </div>

          <button
            onClick={() => { setActivePage('empDash'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'empDash'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#F5A623]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => { setActivePage('hirechat'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'hirechat'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#F5A623]" />
            <span>Post a Job (AI Chat)</span>
          </button>

          <button
            onClick={() => { setActivePage('applicants'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'applicants'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#F5A623]" />
              <span>Applicants</span>
            </div>
            <span className="bg-[#F5A623] text-[#1C1C1E] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {applicants.length}
            </span>
          </button>

          <button
            onClick={() => { setActivePage('postings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activePage === 'postings'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-[#F5A623]" />
              <span>My Job Postings</span>
            </div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {jobs.length}
            </span>
          </button>
        </nav>

        {/* Sidebar Footer with Employer User Chip & Switch Button */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Switch to Worker Portal */}
          <button
            onClick={onSwitchToWorker}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white transition-colors cursor-pointer"
            title="Switch to Job Seeker view to test separated dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Switch to Worker Portal</span>
          </button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1A5C38] border-2 border-[#F5A623] text-white font-bold flex items-center justify-center text-xs">
                {user?.name?.[0]?.toUpperCase() || 'E'}
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || 'Lekki Property Mgt'}
                </div>
                <div className="text-[10px] text-white/60">Hiring Employer</div>
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
              {activePage === 'empDash' && '📊 Hiring Overview'}
              {activePage === 'hirechat' && '💬 Post a Job with Kazi AI'}
              {activePage === 'applicants' && `👥 Review Applicants (${applicants.length})`}
              {activePage === 'postings' && `📋 Managed Job Postings (${jobs.length})`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5C38] bg-[#E8F5EE] px-3 py-1 rounded-full border border-[#D8E8DF]">
              <span className="w-2 h-2 rounded-full bg-[#1A5C38]"></span>
              Hiring Mode
            </span>

            <button
              onClick={() => showToast('18 applicants waiting for review')}
              className="w-8 h-8 rounded-lg border border-[#E2EDE7] flex items-center justify-center text-[#1C1C1E] hover:border-[#1A5C38] relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full ring-2 ring-white"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#1A5C38] text-white font-extrabold flex items-center justify-center text-xs">
              {user?.name?.[0]?.toUpperCase() || 'E'}
            </div>
          </div>
        </header>

        {/* Dynamic Employer Pages */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* 1. EMPLOYER OVERVIEW DASHBOARD */}
          {activePage === 'empDash' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              {/* Header greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2EDE7] shadow-sm">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1E]">
                    Good morning, {user?.name || 'Ada'} 👋🏾
                  </h2>
                  <p className="text-xs md:text-sm text-[#8A8A8A] mt-1">
                    Here's your hiring overview and applicant pipeline.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('hirechat')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A5C38] hover:bg-[#155130] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#F5A623]" />
                  Post New Job
                </button>
              </div>

              {/* 3 Large Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Open Jobs
                    </span>
                    <span className="p-2 rounded-xl bg-[#E8F5EE] text-[#1A5C38]">
                      <Briefcase className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#1A5C38] mt-3">
                    {jobs.filter(j => j.status === 'active').length}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    Active vacancies accepting applications
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Applicants
                    </span>
                    <span className="p-2 rounded-xl bg-[#FEF3DC] text-[#B7791F]">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#B7791F] mt-3">
                    {applicants.length}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    Across all published roles
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E2EDE7] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                      Strong Matches
                    </span>
                    <span className="p-2 rounded-xl bg-[#E8F5EE] text-[#1A5C38]">
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#1A5C38] mt-3">
                    {applicants.filter(a => a.matchRating === 'Strong').length}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1">
                    Highly rated candidate profiles
                  </div>
                </div>
              </div>

              {/* Active Jobs Section */}
              <div className="bg-white p-6 rounded-2xl border border-[#E2EDE7] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1C1C1E]">
                    Active Job Listings
                  </h3>
                  <button
                    onClick={() => setActivePage('postings')}
                    className="text-xs font-bold text-[#1A5C38] hover:underline"
                  >
                    View all postings →
                  </button>
                </div>

                <div className="space-y-3">
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl bg-[#F7FAF8] border border-[#E2EDE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                          {job.skill === 'cleaner' ? '🧹' : job.skill === 'mechanic' ? '🔧' : '🛡️'}
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-[#1C1C1E]">
                            {job.title}
                          </div>
                          <div className="text-[11px] text-[#8A8A8A] mt-0.5">
                            {job.location} · {job.salary} · {job.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-full bg-[#FEF3DC] text-[#B7791F] text-xs font-bold">
                          {job.applicantsCount} applicants
                        </span>
                        <button
                          onClick={() => {
                            setApplicantFilter(job.id);
                            setActivePage('applicants');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1C1E] mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActivePage('hirechat')}
                    className="p-5 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">➕</div>
                    <div className="text-sm font-bold text-[#1C1C1E]">
                      Post New Job
                    </div>
                    <div className="text-xs text-[#8A8A8A]">
                      Tell Kazi AI who you need in plain speech or text
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setApplicantFilter('all');
                      setActivePage('applicants');
                    }}
                    className="p-5 rounded-2xl bg-white border border-[#E2EDE7] hover:border-[#1A5C38] text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-bold text-[#1C1C1E]">
                      View Applicants
                    </div>
                    <div className="text-xs text-[#8A8A8A]">
                      {applicants.length} candidates waiting for review
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. POST A JOB / HIRE CHAT PAGE */}
          {activePage === 'hirechat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F7FAF8]">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {hireChatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-[#1A5C38] text-white'
                          : 'bg-[#F5A623] text-[#1C1C1E]'
                      }`}
                    >
                      {msg.sender === 'user' ? (user?.name?.[0] || 'E') : '🌍'}
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

                      {/* Structured Post Job Preview Card if extracted */}
                      {msg.postingDraft && (
                        <div className="bg-white rounded-xl border border-[#1A5C38] p-4 shadow-md space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-[#1A5C38] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Structured Job Card
                          </div>

                          <div className="space-y-1.5 text-xs text-[#4A4A4A]">
                            <div><strong>Role:</strong> {msg.postingDraft.title}</div>
                            <div><strong>Category:</strong> {msg.postingDraft.skill.toUpperCase()}</div>
                            <div><strong>Location:</strong> {msg.postingDraft.location}</div>
                            <div><strong>Salary / Pay:</strong> {msg.postingDraft.salary}</div>
                            <div><strong>Employment Type:</strong> {msg.postingDraft.type}</div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#E2EDE7]">
                            <button
                              onClick={() => handleConfirmPosting(msg.postingDraft)}
                              className="flex-1 py-2 px-3 rounded-lg bg-[#1A5C38] hover:bg-[#155130] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                            >
                              ✓ Confirm & Post Job
                            </button>
                            <button
                              onClick={() => {
                                setHireInput(`Edit role: ${msg.postingDraft.title}, location: ${msg.postingDraft.location}`);
                                showToast('Editing job details...');
                              }}
                              className="py-2 px-3 rounded-lg border border-[#E2EDE7] hover:border-[#1A5C38] text-xs font-bold transition-colors cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-[#8A8A8A] px-1">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isHireTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#1C1C1E] flex items-center justify-center text-xs font-bold">
                      🌍
                    </div>
                    <div className="bg-white border border-[#E2EDE7] rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                      <span className="w-2 h-2 rounded-full bg-[#1A5C38] typing-dot"></span>
                    </div>
                  </div>
                )}

                <div ref={hireBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 md:p-4 bg-white border-t border-[#E2EDE7]">
                {/* Quick suggestion chips for employer */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    '🧹 Need a Cleaner in Lekki, ₦50,000 per month',
                    '🔧 Looking for a mechanic in Ikeja',
                    '🛡️ I need a security guard for my shop in VI',
                    '🚗 Looking for a driver in Surulere'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendHireMessage(chip)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F7FAF8] hover:bg-[#E8F5EE] text-[#4A4A4A] hover:text-[#1A5C38] border border-[#E2EDE7] transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-[#F7FAF8] border border-[#E2EDE7] focus-within:border-[#1A5C38] rounded-2xl p-2 transition-colors">
                  <textarea
                    rows={1}
                    value={hireInput}
                    onChange={(e) => setHireInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendHireMessage();
                      }
                    }}
                    placeholder="Tell Kazi who you need to hire... or speak 🎤"
                    className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-[#1C1C1E] px-2 resize-none placeholder:text-[#8A8A8A]"
                  />

                  {/* Mic Button */}
                  <button
                    onClick={() => {
                      if (isRecording) {
                        setIsRecording(false);
                        showToast('Transcribing audio...');
                        handleSendHireMessage('I need a cleaner in Lekki, ₦50,000 per month');
                      } else {
                        setIsRecording(true);
                        showToast('Listening... Speak job requirements 🎤');
                        setTimeout(() => {
                          setIsRecording(false);
                          showToast('Transcribing audio...');
                          handleSendHireMessage('I need an experienced driver in Ikeja, ₦110,000 monthly');
                        }, 3500);
                      }
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-[#4A4A4A] hover:bg-[#E8F5EE] hover:text-[#1A5C38]'
                    }`}
                    title="Voice input for job posting"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendHireMessage()}
                    disabled={!hireInput.trim()}
                    className="w-9 h-9 rounded-xl bg-[#1A5C38] hover:bg-[#155130] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-[#8A8A8A] text-center mt-2">
                  Try: "I need a cleaner in Lekki, ₦50,000 per month, start immediately"
                </div>
              </div>
            </div>
          )}

          {/* 3. APPLICANTS PIPELINE PAGE */}
          {activePage === 'applicants' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1E]">
                    Applicants Pipeline ({filteredApplicants.length})
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Review candidate profiles, skill match scores, and verified references.
                  </p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setApplicantFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      applicantFilter === 'all'
                        ? 'bg-[#1A5C38] text-white'
                        : 'bg-white border border-[#E2EDE7] text-[#4A4A4A]'
                    }`}
                  >
                    All ({applicants.length})
                  </button>
                  <button
                    onClick={() => setApplicantFilter('shortlisted')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      applicantFilter === 'shortlisted'
                        ? 'bg-[#1A5C38] text-white'
                        : 'bg-white border border-[#E2EDE7] text-[#4A4A4A]'
                    }`}
                  >
                    Shortlisted ({applicants.filter(a => a.shortlisted).length})
                  </button>
                  {jobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => setApplicantFilter(job.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        applicantFilter === job.id
                          ? 'bg-[#1A5C38] text-white'
                          : 'bg-white border border-[#E2EDE7] text-[#4A4A4A]'
                      }`}
                    >
                      {job.title}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApplicants.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E2EDE7] p-8">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="text-base font-bold text-[#1C1C1E]">No applicants found</div>
                  <div className="text-xs text-[#8A8A8A] max-w-sm mx-auto mt-1 mb-4">
                    There are no candidates matching this specific filter right now.
                  </div>
                  <button
                    onClick={() => setApplicantFilter('all')}
                    className="px-4 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold"
                  >
                    View All Applicants
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApplicants.map(candidate => (
                    <div
                      key={candidate.id}
                      className="bg-white p-5 rounded-2xl border border-[#E2EDE7] hover:border-[#1A5C38] transition-all shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-xl font-extrabold text-[#1A5C38] flex-shrink-0">
                            {candidate.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-[#1C1C1E]">
                                {candidate.name}
                              </span>
                              {candidate.verified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A5C38] bg-[#E8F5EE] px-1.5 py-0.5 rounded">
                                  <ShieldCheck className="w-3 h-3" /> Verified ID
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#8A8A8A] mt-0.5">
                              Applying for: <strong className="text-[#1C1C1E]">{candidate.role}</strong> · {candidate.experience}
                            </div>
                            <div className="text-[11px] text-[#8A8A8A]">
                              📍 {candidate.location} · Applied {candidate.appliedAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              candidate.matchRating === 'Strong'
                                ? 'bg-[#E8F5EE] text-[#1A5C38]'
                                : 'bg-[#FEF3DC] text-[#B7791F]'
                            }`}
                          >
                            ⭐ {candidate.matchRating} ({candidate.matchRatingScore})
                          </span>
                        </div>
                      </div>

                      {/* Matched skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {candidate.matches.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] font-bold text-[#1A5C38] bg-[#E8F5EE] px-2 py-0.5 rounded"
                          >
                            ✓ {m}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[#E2EDE7]/70">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-4 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] transition-colors cursor-pointer"
                        >
                          View Candidate Profile
                        </button>
                        <button
                          onClick={() => showToast(`Message sent to ${candidate.name} via WhatsApp/SMS! 💬`)}
                          className="px-3 py-2 rounded-xl border border-[#E2EDE7] hover:border-[#1A5C38] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </button>
                        <button
                          onClick={() => toggleShortlist(candidate.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            candidate.shortlisted
                              ? 'bg-[#FEF3DC] border-[#F5A623] text-[#B7791F]'
                              : 'border-[#E2EDE7] hover:border-[#1A5C38] text-[#4A4A4A]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          {candidate.shortlisted ? 'Shortlisted ✓' : 'Shortlist'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. MY JOB POSTINGS MANAGER */}
          {activePage === 'postings' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1E]">
                    Managed Job Postings ({jobs.length})
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Activate, pause, or view applicants for your published vacancies.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('hirechat')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#F5A623]" /> Post New Job
                </button>
              </div>

              <div className="space-y-3">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-[#E2EDE7] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1C1C1E]">
                          {job.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.status === 'active'
                              ? 'bg-[#E8F5EE] text-[#1A5C38]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {job.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="text-xs text-[#8A8A8A] mt-1">
                        📍 {job.location} · 💰 {job.salary} · 🕐 {job.type}
                      </div>
                      <div className="text-[11px] text-[#8A8A8A] mt-0.5">
                        Posted {job.postedDate} · {job.applicantsCount} total applicants
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setApplicantFilter(job.id);
                          setActivePage('applicants');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] cursor-pointer"
                      >
                        View Applicants ({job.applicantsCount})
                      </button>
                      <button
                        onClick={() => {
                          setJobs(prev =>
                            prev.map(j =>
                              j.id === job.id
                                ? { ...j, status: j.status === 'active' ? 'paused' : 'active' }
                                : j
                            )
                          );
                          showToast(`Job status updated!`);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#E2EDE7] hover:border-[#1A5C38] text-xs font-bold cursor-pointer"
                      >
                        {job.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CANDIDATE PROFILE MODAL ── */}
          {selectedCandidate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2EDE7]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] text-[#1A5C38] flex items-center justify-center font-extrabold text-xl">
                      {selectedCandidate.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1C1C1E]">
                        {selectedCandidate.name}
                      </h3>
                      <div className="text-xs text-[#8A8A8A]">
                        {selectedCandidate.role} · {selectedCandidate.experience}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#4A4A4A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs md:text-sm text-[#4A4A4A]">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] mb-1">
                      Candidate Bio & Background
                    </h4>
                    <p className="leading-relaxed bg-[#F7FAF8] p-3 rounded-xl border border-[#E2EDE7]">
                      {selectedCandidate.bio}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] mb-1">
                      Contact Information
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#1A5C38]" /> {selectedCandidate.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#1A5C38]" /> {selectedCandidate.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#1A5C38]" /> {selectedCandidate.location}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] mb-1">
                      Verification Status
                    </h4>
                    <div className="flex items-center gap-2 text-[#1A5C38] font-bold">
                      <ShieldCheck className="w-4 h-4" /> Identity Verified via NIN/Voter's Card & Guarantor Confirmed
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#E2EDE7]">
                  <button
                    onClick={() => {
                      showToast(`Contact initiated with ${selectedCandidate.name}! 📞`);
                      setSelectedCandidate(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A5C38] text-white text-xs font-bold hover:bg-[#155130] cursor-pointer"
                  >
                    Call Candidate
                  </button>
                  <button
                    onClick={() => {
                      toggleShortlist(selectedCandidate.id);
                      setSelectedCandidate(null);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-[#E2EDE7] hover:border-[#1A5C38] text-xs font-bold cursor-pointer"
                  >
                    {selectedCandidate.shortlisted ? 'Remove Shortlist' : 'Shortlist Candidate'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Bottom Bar for Employer Navigation */}
        <div className="md:hidden h-14 bg-white border-t border-[#E2EDE7] flex items-center justify-around px-2 z-10">
          <button
            onClick={() => setActivePage('empDash')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'empDash' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-bold">Overview</span>
          </button>

          <button
            onClick={() => setActivePage('hirechat')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'hirechat' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[9px] font-bold">Post Job</span>
          </button>

          <button
            onClick={() => setActivePage('applicants')}
            className={`flex flex-col items-center gap-0.5 relative ${
              activePage === 'applicants' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-bold">Applicants</span>
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#F5A623] text-[#1C1C1E] rounded-full text-[8px] font-extrabold flex items-center justify-center">
              {applicants.length}
            </span>
          </button>

          <button
            onClick={() => setActivePage('postings')}
            className={`flex flex-col items-center gap-0.5 ${
              activePage === 'postings' ? 'text-[#1A5C38]' : 'text-[#8A8A8A]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[9px] font-bold">Postings</span>
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
