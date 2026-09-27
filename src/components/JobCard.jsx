import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Scissors,
  Car,
  Zap,
  Flame,
  Droplets,
  Store,
  ShieldCheck,
  Hammer,
  Palette,
  Utensils,
  Sprout,
  HardHat,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  CheckCircle2,
  Bookmark,
  Send,
  Check
} from 'lucide-react';

/**
 * Returns distinct icon, category color, and badge background based on skill/job title
 */
function getJobCategoryDetails(skill = '', title = '') {
  const text = (skill + ' ' + title).toLowerCase();

  // 1. Trades & Crafts (Terracotta #E8632C)
  if (text.includes('mechanic')) return { icon: Wrench, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('electrician') || text.includes('solar') || text.includes('wiring')) return { icon: Zap, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('welder') || text.includes('fabricator')) return { icon: Flame, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('carpenter') || text.includes('wood')) return { icon: Hammer, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('painter')) return { icon: Palette, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('plumber') || text.includes('pipe')) return { icon: Droplets, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
  if (text.includes('mason') || text.includes('brick')) return { icon: HardHat, color: '#E8632C', category: 'Trades', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };

  // 2. Services & Hospitality (Ochre Gold #F2A03D)
  if (text.includes('cleaner') || text.includes('cleaning')) return { icon: Sparkles, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };
  if (text.includes('tailor') || text.includes('apparel')) return { icon: Scissors, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };
  if (text.includes('hair') || text.includes('stylist') || text.includes('braid')) return { icon: Scissors, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };
  if (text.includes('cook') || text.includes('chef') || text.includes('buka')) return { icon: Utensils, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };
  if (text.includes('gardener') || text.includes('lawn')) return { icon: Sprout, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };
  if (text.includes('security') || text.includes('guard')) return { icon: ShieldCheck, color: '#F2A03D', category: 'Services', bgClass: 'bg-[#F2A03D]/20 border-[#F2A03D]/40 text-[#F2A03D]' };

  // 3. Logistics & Retail (Emerald #10B981)
  if (text.includes('driver') || text.includes('rider') || text.includes('delivery')) return { icon: Car, color: '#10B981', category: 'Logistics', bgClass: 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]' };
  if (text.includes('vendor') || text.includes('sales') || text.includes('kiosk') || text.includes('mart')) return { icon: Store, color: '#10B981', category: 'Retail', bgClass: 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]' };

  // Default Fallback
  return { icon: Briefcase, color: '#E8632C', category: 'General', bgClass: 'bg-[#E8632C]/20 border-[#E8632C]/40 text-[#E8632C]' };
}

export default function JobCard({ job, onApply, onSave, isSaved: initialIsSaved = false, isApplied: initialIsApplied = false }) {
  const { id, title, skill, location, salary, company_name, type, matched_fields } = job;
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isApplied, setIsApplied] = useState(initialIsApplied);

  const categoryDetails = getJobCategoryDetails(skill, title);
  const IconComponent = categoryDetails.icon;

  const isSkillMatched = matched_fields?.includes('skill');
  const isLocationMatched = matched_fields?.includes('location');
  const isTypeMatched = matched_fields?.includes('type');

  const handleApplyClick = () => {
    setIsApplied(true);
    if (onApply) onApply(job);
  };

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave(job);
  };

  return (
    <div
      className="my-3.5 p-4 md:p-5 rounded-xl bg-[#12102A] shadow-lg border-y border-r border-gray-800/80 hover:border-gray-700 transition-all duration-200 relative overflow-hidden"
      style={{ borderLeft: `5px solid ${categoryDetails.color}` }}
    >
      {/* Top Badge Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Top-Left Distinct Icon Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold font-heading tracking-wide ${categoryDetails.bgClass}`}>
            <IconComponent className="w-3.5 h-3.5" />
            <span className="uppercase">{categoryDetails.category} • {skill}</span>
          </div>

          {isSkillMatched && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E8632C]/20 text-[#E8632C] px-2 py-0.5 rounded-full border border-[#E8632C]/40">
              <CheckCircle2 className="w-3 h-3" /> Matched
            </span>
          )}
        </div>

        {/* Save/Bookmark Button */}
        <button
          onClick={handleSaveClick}
          title={isSaved ? "Saved to Dashboard" : "Save Job"}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isSaved
              ? 'bg-[#F2A03D]/20 border-[#F2A03D] text-[#F2A03D]'
              : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#F2A03D]' : ''}`} />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-base md:text-lg uppercase tracking-wider text-[#F5F0E8] mb-3 leading-snug">
        {title}
      </h3>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs md:text-sm text-[#F5F0E8]/85 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#F2A03D] shrink-0" />
          <span>{location}</span>
          {isLocationMatched && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#E8632C]" title="Location Matched" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#F2A03D] shrink-0" />
          <span className="font-semibold text-[#F5F0E8]">{salary}</span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#F2A03D] shrink-0" />
          <span>{company_name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#F2A03D] shrink-0" />
          <span className="capitalize">{type}</span>
          {isTypeMatched && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#E8632C]" title="Type Matched" />
          )}
        </div>
      </div>

      {/* Distinct Asymmetric Quick Apply CTA Button */}
      <div className="pt-2 border-t border-gray-800/60 flex items-center justify-end">
        <button
          onClick={handleApplyClick}
          disabled={isApplied}
          className={`inline-flex items-center gap-2 px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md ${
            isApplied
              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs'
              : 'bg-[#E8632C] hover:bg-[#D2531F] text-white rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs shadow-[#E8632C]/20 hover:scale-105'
          }`}
        >
          {isApplied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Applied & Saved
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Quick Apply
            </>
          )}
        </button>
      </div>
    </div>
  );
}
