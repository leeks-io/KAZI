import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Sparkles } from 'lucide-react';
import StatsRow from './StatsRow';

export default function Hero({ onStartChatting }) {
  const words = ["SPEAK", "MATCH", "WORK"];

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden px-6 pt-2 pb-10 max-w-7xl mx-auto">
      {/* Video Background Layer with Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl my-2 mx-2">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 scale-105 filter contrast-125 saturate-110"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-african-market-sellers-and-shoppers-42861-large.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark Indigo Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#12102A]/90 via-[#12102A]/75 to-[#12102A]" />
      </div>

      {/* Top Stats Section */}
      <div className="w-full flex justify-end">
        <StatsRow />
      </div>

      {/* Hero Center & Bottom Row Content */}
      <div className="mt-8 md:mt-16 flex flex-col gap-8">
        
        {/* Row 1: Tagline Left / Asymmetric CTA Button Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F5F0E8]/10 pb-5"
        >
          <div className="flex items-center gap-2 text-[#E8632C] font-heading font-bold text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E8632C] animate-ping" />
            FIND WORK / NO WAHALA
          </div>

          <button
            onClick={onStartChatting}
            className="group inline-flex items-center gap-3 px-6 py-3.5 bg-[#E8632C] hover:bg-[#D2531F] text-white font-heading font-bold text-xs md:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#E8632C]/25 hover:shadow-[#E8632C]/40 hover:scale-105 cursor-pointer rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs"
          >
            Start Chatting
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Row 2: Description Left / Large 3-Word Stacked Heading Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Description Text Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5 space-y-4"
          >
            <p className="text-lg md:text-xl text-[#F5F0E8]/90 font-light leading-relaxed">
              Africa’s voice-first, two-sided job platform. Speak in your natural voice or type to instantly match skilled workers with employers across Lagos, Nairobi, Accra, & Kampala.
            </p>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#191638] border border-[#F2A03D]/40 text-[#F2A03D] text-xs font-semibold">
                <Mic className="w-3.5 h-3.5" /> Voice & Text Matching
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#191638] border border-[#E8632C]/40 text-[#E8632C] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Gemini AI Powered
              </div>
            </div>
          </motion.div>

          {/* Large 3-Word Stacked Heading Right: SPEAK / MATCH / WORK */}
          <div className="lg:col-span-7 flex flex-col items-start lg:items-end justify-end">
            {words.map((word, index) => (
              <div key={index} className="overflow-hidden leading-none py-1">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.15,
                    ease: [0.215, 0.61, 0.355, 1.0]
                  }}
                  className="font-heading font-extrabold uppercase text-[#F5F0E8] tracking-tighter"
                  style={{
                    fontSize: 'clamp(2.5rem, 8.5vw, 8.5rem)',
                    lineHeight: 0.9,
                  }}
                >
                  {word}
                </motion.h1>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
