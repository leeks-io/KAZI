import React from 'react';
import { motion } from 'framer-motion';
import JobCard from './JobCard';
import KaziLogo from './KaziLogo';

export default function MessageBubble({ message, onApplyJob, onSaveJob, applications = [], savedJobs = [] }) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Kazi Logo Avatar for Bot */}
      {!isUser && (
        <div className="shrink-0 mt-1">
          <KaziLogo size={28} className="scale-90 pointer-events-none" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 font-sans text-sm md:text-base leading-relaxed ${
          isUser
            ? 'bg-[#E8632C] text-white rounded-tr-none shadow-lg'
            : 'bg-[#12102A] border border-gray-800/80 text-[#F5F0E8] rounded-tl-none shadow-md'
        }`}
      >
        {/* Message Content */}
        {message.transcript && (
          <div className="text-xs font-semibold uppercase tracking-wider text-[#F2A03D] mb-1.5 flex items-center gap-1.5">
            <span>🎙️ Transcribed Voice Note:</span>
          </div>
        )}

        <div className="whitespace-pre-line">{message.text}</div>

        {/* If message contains job cards */}
        {message.jobs && message.jobs.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={onApplyJob}
                onSave={onSaveJob}
                isApplied={applications.some(a => a.id === job.id)}
                isSaved={savedJobs.some(s => s.id === job.id)}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-2 text-right ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
