'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SERVICE_PILLARS } from '@/lib/constants';

export function ServicesPageClient() {
  const [active, setActive] = useState<string>(SERVICE_PILLARS[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SERVICE_PILLARS.forEach((p) => {
      const el = document.getElementById(p.id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(p.id);
          });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="container-page relative grid gap-16 lg:grid-cols-[220px_1fr] lg:gap-20">
      {/* Sticky side nav */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-1">
          <div className="section-eyebrow mb-6">Services</div>
          {SERVICE_PILLARS.map((p) => {
            const isActive = active === p.id;
            return (
              <a
                key={p.id}
                href={`#${p.id}`}
                className={`group relative block border-l py-2.5 pl-4 text-sm transition-colors ${
                  isActive
                    ? 'border-violet-glow text-white'
                    : 'border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="services-side-active"
                    className="absolute -left-px top-0 h-full w-[2px] bg-gradient-to-b from-violet-glow to-gold"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="mr-2 text-xs text-white/30">{p.number}</span>
                {p.title}
              </a>
            );
          })}

          <div className="pt-10">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-sm text-violet-soft hover:text-gold"
            >
              Discuss your project
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-32">
        {SERVICE_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <section
              key={pillar.id}
              id={pillar.id}
              className="scroll-mt-28"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-display text-sm tracking-[0.3em] text-violet-soft">
                    {pillar.number}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-glow/40 via-white/10 to-transparent" />
                  <div className="rounded-full border border-white/10 bg-ink-800 p-2.5">
                    <Icon className="h-5 w-5 text-violet-soft" />
                  </div>
                </div>

                <h2 className="text-display mt-8 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                  {pillar.title}
                </h2>
                <p className="text-accent-italic mt-2 text-2xl text-gradient md:text-3xl">
                  {pillar.headline}
                </p>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                  {pillar.blurb}
                </p>
              </motion.div>

              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {pillar.items.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-violet-glow/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
                          <ItemIcon className="h-5 w-5 text-violet-soft transition-colors group-hover:text-gold" />
                        </div>
                        <div>
                          <h3 className="text-display text-lg font-semibold text-white">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/60">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Real Service Image Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="group relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/services/${pillar.id}.webp`}
                  alt={`${pillar.title} Preview`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                
                {/* Dark overlay gradients for text readability and cinematic depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950/40 via-transparent to-transparent" />
                
                {/* Tiny premium corner labels */}
                <div className="absolute bottom-6 left-6 z-10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                    Discipline Showcase
                  </div>
                  <div className="text-accent-italic mt-1.5 text-2xl font-medium text-white md:text-3xl">
                    {pillar.title}
                  </div>
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
