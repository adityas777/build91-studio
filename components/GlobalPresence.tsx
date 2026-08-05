'use client';

import { motion } from 'framer-motion';

/* ── Data ──────────────────────────────────────────────────────────────────── */
type Role = 'Studio' | 'Sales' | 'Client';

interface MapPin {
  id: string;
  label: string;
  role: Role;
  cx: number; // % across stylised globe
  cy: number; // % down stylised globe
}

const CLIENT_REACH = ['India', 'UAE', 'Australia'];

// Approximate positions on a stylised globe centred on the Indian Ocean
const MAP_PINS: MapPin[] = [
  { id: 'raipur', label: 'Raipur', role: 'Studio', cx: 52, cy: 42 },
  { id: 'bengaluru', label: 'Bengaluru', role: 'Sales', cx: 50, cy: 54 },
  { id: 'india', label: 'INDIA', role: 'Client', cx: 48, cy: 32 },
  { id: 'uae', label: 'UAE', role: 'Client', cx: 36, cy: 44 },
  { id: 'australia', label: 'Australia', role: 'Client', cx: 76, cy: 72 },
];

/* ── Styling per role ─────────────────────────────────────────────────────── */
const ROLE_STYLE: Record<Role, { dot: string; ping: string; label: string; pillBorder: string; pillBg: string }> = {
  Studio: {
    dot: 'bg-gold shadow-[0_0_14px_4px_rgba(224,184,114,0.65)]',
    ping: 'bg-gold/35',
    label: 'text-gold',
    pillBorder: 'border-gold/30',
    pillBg: 'bg-gold/[0.06]',
  },
  Sales: {
    dot: 'bg-violet-glow shadow-[0_0_14px_4px_rgba(124,58,237,0.7)]',
    ping: 'bg-violet-glow/60',
    label: 'text-violet-soft',
    pillBorder: 'border-violet-glow/30',
    pillBg: 'bg-violet-glow/[0.06]',
  },
  Client: {
    dot: 'bg-white shadow-[0_0_12px_5px_rgba(255,255,255,0.65)]',
    ping: 'bg-white/60',
    label: 'text-white',
    pillBorder: 'border-white/30',
    pillBg: 'bg-white/[0.06]',
  },
};

/* ── Component ─────────────────────────────────────────────────────────────── */
export function GlobalPresence() {
  return (
    <div className="space-y-10 md:space-y-20">
      {/* Top: heading + client reach + globe */}
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <span className="section-eyebrow">Global Presence</span>
          <h2 className="section-heading mt-4">
            Clients on three continents. <br />
          </h2>

          {/* Client reach */}
          <div className="mt-8 md:mt-10">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Client Reach
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CLIENT_REACH.map((country) => {
                const s = ROLE_STYLE.Client;
                return (
                  <li
                    key={country}
                    className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-sm text-white/80 ${s.pillBorder} ${s.pillBg}`}
                  >
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    {country}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Stylised mock globe with hotspots */}
        <motion.div
          className="relative aspect-square w-full max-w-[340px] mx-auto md:max-w-[480px]"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Outer glow halo */}
          <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-violet-deep/25 via-transparent to-gold/10 blur-2xl" />

          {/* Globe body */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-deep/20 via-ink-700/30 to-transparent" />
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-6 rounded-full border border-white/5" />
          <div className="absolute inset-12 rounded-full border border-white/5" />

          {/* Latitude / longitude lines */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full text-violet-glow/20"
            aria-hidden
          >
            <ellipse cx="50" cy="50" rx="48" ry="20" fill="none" stroke="currentColor" />
            <ellipse cx="50" cy="50" rx="48" ry="40" fill="none" stroke="currentColor" />
            <ellipse cx="50" cy="50" rx="20" ry="48" fill="none" stroke="currentColor" />
            <ellipse cx="50" cy="50" rx="40" ry="48" fill="none" stroke="currentColor" />
          </svg>

          {/* Hotspots */}
          {MAP_PINS.map((p, i) => {
            const s = ROLE_STYLE[p.role];
            const isOp = p.role !== 'Client';
            const dotSize = isOp ? 12 : 8;
            const pingSize = isOp ? 18 : 12;
            return (
              <motion.div
                key={p.id}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="absolute"
                style={{ left: `${p.cx}%`, top: `${p.cy}%` }}
              >
                <div className="relative">
                  <span
                    className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full ${s.ping}`}
                    style={{ width: pingSize, height: pingSize }}
                  />
                  <span
                    className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${s.dot}`}
                    style={{ width: dotSize, height: dotSize }}
                  />
                  <span
                    className={`absolute whitespace-nowrap font-semibold uppercase tracking-[0.2em] ${s.label} ${isOp
                      ? 'left-4 top-1 text-xs'
                      : `top-0 text-[11px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] ${p.cx > 60 ? 'right-4 text-right' : 'left-4'
                      }`
                      }`}
                  >
                    {p.label}
                  </span>
                  {isOp && (
                    <span className="absolute left-4 top-5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.25em] text-white/45">
                      {p.role}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Center glow */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-glow/30 blur-3xl" />
        </motion.div>
      </div>

    </div>
  );
}
