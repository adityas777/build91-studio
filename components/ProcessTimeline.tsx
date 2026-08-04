'use client';

import { motion } from 'framer-motion';
import { PROCESS_STEPS } from '@/lib/constants';

export function ProcessTimeline() {
  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-violet-glow/40 to-transparent md:block" />

      <div className="grid gap-10 md:grid-cols-4 md:gap-6">
        {PROCESS_STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="relative"
          >
            <div className="relative flex flex-col items-start">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-violet-glow/30" />
                <div className="absolute inset-2 rounded-full border border-violet-glow/20" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-glow/30 to-violet-deep/20 backdrop-blur-md" />
                <span className="text-display relative text-2xl font-semibold text-white">
                  {step.number}
                </span>
              </div>
            </div>

            <h4 className="text-display mt-6 text-xl font-semibold text-white">
              {step.title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
