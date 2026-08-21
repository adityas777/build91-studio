'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

/**
 * Testimonials — single large quote, cross-fade rotation. No carousel dots.
 *
 * REPLACE: swap in real client quotes + headshots once they're collected.
 * Headshots should be square (400×400 min) and live in /public/images/clients/.
 * Until then, initials render on a gradient avatar.
 */

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string; // REPLACE: e.g. '/images/clients/anita-rao.jpg'
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Their Digital Launchpad significantly transformed our sales. The aerial drone integration and location intelligence video was big plus for our project.',
    author: 'Anita Rao',
    role: 'Director of Sales',
    company: 'Vertex Realty',
  },
  {
    quote:
      'Great company. Their responses are timely and thorough and they execute renderings on time and with an eye for detail. They are my long term partner now!',
    author: 'Rohan Mehta',
    role: 'Founder',
    company: 'Crestline Estates',
  },
  {
    quote:
      'Build91 has been a dependable partner for our fitout projects. Their 3D renders help us align quickly with clients. They make completing client approvals and final execution much smoother.',
    author: 'Amin Khalid',
    role: 'Fitout Solutions',
    company: 'Dubai',
  },
  {
    quote:
      'Working with the team on our project Showcase Video and the microsite was seamless. The attention to detail in all aspects of engagement has been exceptional.',
    author: 'Ashwajeet Singh',
    role: 'Head of Marketing',
    company: 'TVS Emerald',
  },
  {
    quote:
      'Build91 has been great to work with. Their 3D renders are clean, realistic, and really help communicate my designs better. The team is responsive and easy to work with.',
    author: 'Sophie Williams',
    role: 'Interior Designer',
    company: 'Sydney',
  },
];

const ROTATE_MS = 6500;

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setI((n) => (n + 1) % TESTIMONIALS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [paused]);

  const t = TESTIMONIALS[i];

  return (
    <section
      className="section-base section-warm relative overflow-hidden py-16 md:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-72 w-72 rounded-full bg-violet-glow/15 blur-[140px]" />

      <div className="container-page">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">In Their Words</span>
        </AnimatedSection>

        <div className="relative mx-auto mt-8 max-w-4xl md:mt-12">
          <Quote
            aria-hidden
            className="mx-auto h-10 w-10 text-gold/70 md:h-12 md:w-12"
          />

          <div className="relative mt-8 flex min-h-[320px] flex-col items-center justify-center sm:min-h-[280px] md:min-h-[250px] lg:min-h-[230px]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col items-center text-center cursor-grab active:cursor-grabbing select-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  const threshold = 50; // min distance in px to register a swipe
                  if (info.offset.x < -threshold) {
                    // Swiped left -> show next
                    setI((n) => (n + 1) % TESTIMONIALS.length);
                  } else if (info.offset.x > threshold) {
                    // Swiped right -> show prev
                    setI((n) => (n - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
                  }
                }}
              >
                <blockquote className="text-display text-2xl font-medium leading-snug text-white md:text-3xl lg:text-[2.2rem] lg:leading-[1.25]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-4">
                  <Avatar
                    src={t.avatarUrl}
                    name={t.author}
                  />
                  <div className="text-left">
                    <div className="text-display text-base font-semibold text-white">
                      {t.author}
                    </div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.22em] text-violet-soft">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Progress segments — replace pagination dots with a tasteful timeline */}
          <div className="mt-10 flex items-center justify-center gap-2 md:mt-14">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show testimonial ${idx + 1}`}
                className={`h-[2px] rounded-full transition-all ${idx === i ? 'w-12 bg-gold' : 'w-6 bg-white/20 hover:bg-white/40'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20 md:h-14 md:w-14"
      />
    );
  }
  return (
    <div className="text-display flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-deep to-violet-glow text-sm font-semibold text-white ring-1 ring-white/15 md:h-14 md:w-14">
      {initials}
    </div>
  );
}
