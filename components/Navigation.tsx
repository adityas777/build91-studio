'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/lib/constants';

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (pathname?.startsWith('/feedback')) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-ink-900/70 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container-page flex h-20 items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2"
            aria-label={`${SITE.name} home`}
          >
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={56}
              height={56}
              priority
              className="h-11 w-11 rounded-full shadow-[0_4px_20px_-4px_rgba(124,58,237,0.5)] ring-1 ring-white/20 transition-all group-hover:ring-violet-glow/60 md:h-12 md:w-12"
            />
            <span className="hidden text-sm font-medium tracking-[0.18em] text-white/80 sm:inline-block">
              BUILD<span className="text-violet-soft">91</span>
              <span className="text-accent-italic ml-1 text-white/55">studio</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-white/10 ring-1 ring-violet-glow/40"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/quote"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Get a Quote
            </Link>
            <Link href="/contact" className="btn-primary">
              Let&rsquo;s Talk
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white backdrop-blur-md lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ink-900/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="absolute inset-0 bg-mesh opacity-40" />
            <div className="relative flex h-full flex-col px-6 pb-12 pt-28">
              <nav className="flex flex-1 flex-col justify-center gap-2">
                {NAV_LINKS.map((link, i) => {
                  const active = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                    >
                      <Link
                        href={link.href}
                        className={`block border-b border-white/10 py-5 text-3xl font-medium ${
                          active ? 'text-gradient' : 'text-white/80'
                        }`}
                      >
                        <span className="mr-3 text-sm text-violet-soft/80">
                          0{i + 1}
                        </span>
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-6 space-y-3"
              >
                <Link href="/quote" className="btn-secondary w-full">
                  Get a Quote
                </Link>
                <Link href="/contact" className="btn-primary w-full">
                  Let&rsquo;s Talk
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="pt-2 text-center text-sm text-white/50">
                  {SITE.phoneDisplay} · {SITE.email}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
