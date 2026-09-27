import React from 'react';
import { motion } from 'framer-motion';

export default function TogglePill({ activeTab, onToggle }) {
  const tabs = [
    { id: 'find_job', label: 'Find Work' },
    { id: 'post_job', label: 'Post a Job' },
  ];

  return (
    <div className="inline-flex items-center p-1.5 rounded-full bg-[#12102A] border border-[#E8632C]/30 relative shadow-inner">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onToggle(tab.id)}
            className={`relative z-10 px-6 py-2.5 rounded-full font-heading text-xs md:text-sm font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
              isActive ? 'text-white' : 'text-[#F5F0E8]/60 hover:text-[#F5F0E8]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-[#E8632C] rounded-full shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
