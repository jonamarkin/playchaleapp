'use client';

import React, { useState } from 'react';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';

interface ContactModalProps {
  type: 'contact' | 'booking' | 'details' | null;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ type, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(onClose, 2500);
    }, 1500);
  };

  const getTitle = () => {
    if (type === 'booking') return 'Book Your Session';
    if (type === 'details') return 'Program Overview';
    return 'Get In Touch';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden p-8 md:p-12"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90"
        >
          <ICONS.X />
        </button>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <div className="w-24 h-24 bg-[#C6FF00] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">Success!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Our team will contact you within 24 hours.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C6FF00] bg-black px-4 py-1.5 rounded-full">
                {type?.toUpperCase()}
              </span>
              <h2 className="text-5xl font-black tracking-tighter leading-none">{getTitle()}</h2>
            </div>

            {type === 'details' ? (
              <div className="space-y-6">
                <p className="text-gray-500 text-lg leading-relaxed font-medium">
                  This program includes comprehensive on-court coaching, performance video analysis, and a personalized physical conditioning plan. Join over 500 graduates who have leveled up their game with Ace.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Schedule', value: '3x Weekly' },
                    { label: 'Duration', value: '90 Min / Session' },
                    { label: 'Level', value: 'Intermediate +' },
                    { label: 'Coach Ratio', value: '1:4 Students' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 p-6 rounded-[32px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                      <p className="text-xl font-black">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setSubmitted(true)}
                  className="w-full bg-black text-white rounded-full py-5 font-black uppercase tracking-widest text-xs hover:bg-[#C6FF00] hover:text-black transition-all"
                >
                  Join This Program
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-4">Full Name</label>
                    <input required className="w-full bg-gray-50 rounded-full px-8 py-4 border-2 border-transparent focus:border-black outline-none transition-all font-bold" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-4">Email Address</label>
                    <input required type="email" className="w-full bg-gray-50 rounded-full px-8 py-4 border-2 border-transparent focus:border-black outline-none transition-all font-bold" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-4">Special Requests</label>
                  <textarea rows={3} className="w-full bg-gray-50 rounded-[32px] px-8 py-6 border-2 border-transparent focus:border-black outline-none transition-all font-bold resize-none" placeholder="Tell us about your tennis background..." />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-black text-white rounded-full py-5 font-black uppercase tracking-widest text-xs hover:bg-[#C6FF00] hover:text-black transition-all flex items-center justify-center gap-4 group"
                >
                  {loading ? 'Processing...' : 'Submit Inquiry'}
                  {!loading && <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform"><ICONS.ChevronRight /></div>}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ContactModal;
