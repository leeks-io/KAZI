import React from 'react';
import { motion } from 'framer-motion';
import AfricanPattern from './AfricanPattern';

export default function StatsRow() {
  const stats = [
    { number: '500', label: 'WORKERS MATCHED' },
    { number: '120', label: 'COMPANIES HIRING' },
    { number: '4', label: 'COUNTRIES LIVE' },
  ];

  return (
    <div className="relative rounded-2xl bg-[#191638]/60 border border-gray-800/80 p-4 md:px-6 md:py-4 overflow-hidden backdrop-blur-sm">
      {/* Subtle Adire/Kente Visual Pattern Texture */}
      <AfricanPattern className="opacity-10" />

      <div className="relative z-10 flex flex-wrap items-center justify-end gap-6 md:gap-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
            className="text-right"
          >
            <div className="font-heading font-extrabold text-2xl md:text-3xl text-[#F5F0E8] tracking-tight">
              <span className="text-[#E8632C] mr-0.5">+</span>
              {stat.number}
            </div>
            <div className="font-sans text-[10px] md:text-xs font-semibold tracking-widest text-[#F5F0E8]/70 uppercase">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
