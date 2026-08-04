'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { SERVICE_PILLARS } from '@/lib/constants';

type Props = {
  pillarId: string;
  index: number;
};

export function ServiceCard({ pillarId, index }: Props) {
  const pillar = SERVICE_PILLARS.find((p) => p.id === pillarId);
  if (!pillar) return null;
  const Icon = pillar.icon;
  return (
    <Link
      href={`/services#${pillar.id}`}
      className="group relative block h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        whileHover={{ y: -6 }}
        className={`relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${pillar.accent} p-7 backdrop-blur-md transition-all duration-500 group-hover:border-violet-glow/40`}
      >
        {/* Glow border on hover */}
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-glow/0 via-violet-glow/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium tracking-[0.3em] text-white/40">
              {pillar.number}
            </span>
            <div className="rounded-full border border-white/10 bg-ink-900/60 p-2.5 backdrop-blur-md">
              <Icon className="h-5 w-5 text-violet-soft transition-colors group-hover:text-gold" />
            </div>
          </div>

          <h3 className="text-display mt-10 text-2xl font-semibold text-white md:text-3xl">
            {pillar.title}
          </h3>
          <p className="text-accent-italic mt-1 text-lg text-violet-soft">
            {pillar.headline}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-white/65">
            {pillar.blurb}
          </p>

          <div className="mt-auto flex items-center gap-2 pt-8 text-sm font-medium text-white/80 transition-colors group-hover:text-gold">
            Explore
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
