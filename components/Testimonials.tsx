import React from 'react';
import { TESTIMONIALS } from '@/constants';
import TestimonialCard from '@/components/TestimonialCard';

const Testimonials: React.FC = () => {
  return (
    <section className="pc-content-visibility py-24 md:py-48 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-24 md:mb-40">
          <div className="inline-flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-black/30">
            <span className="w-3 h-3 rounded-full bg-[#C6FF00] shadow-[0_0_15px_#C6FF00]"></span>
            OUR COMMUNITY
          </div>
          <h2 className="text-6xl md:text-9xl font-black text-[#111111] leading-[0.85] tracking-tighter">
            Real Stories. <br className="hidden md:block" /> Real Growth.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-16 md:gap-32">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
