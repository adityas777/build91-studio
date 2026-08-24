'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  User, 
  Building2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SITE } from '@/lib/constants';

export function FeedbackAdminClient() {
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = Boolean(clientName.trim() || organization.trim());

  // Generate live client link
  const generatedUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    if (clientName.trim()) params.set('client', clientName.trim());
    if (organization.trim()) params.set('org', organization.trim());
    const queryString = params.toString();
    
    if (!queryString) {
      return '';
    }
    return origin ? `${origin}/feedback?${queryString}` : `/feedback?${queryString}`;
  }, [clientName, organization, mounted]);

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    if (!generatedUrl) return;
    const greeting = clientName.trim() ? `Hi ${clientName.trim()},` : 'Hi,';
    const text = encodeURIComponent(
      `${greeting} please share your quick feedback on your project with Build91 Studio: ${generatedUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-ink-900 text-white flex flex-col justify-between selection:bg-gold/30 selection:text-gold relative overflow-x-hidden font-body">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-radial-gradient from-violet-glow/20 via-violet-deep/10 to-transparent blur-[140px] opacity-70" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-radial-gradient from-gold/10 via-transparent to-transparent blur-[140px] opacity-50" />
        <div className="absolute inset-0 bg-grid-soft opacity-15" />
      </div>

      {/* Top Header */}
      <header className="w-full border-b border-white/10 bg-ink-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/20 p-0.5 bg-white/5 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={SITE.logo}
                alt="Build91 Studio Logo"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-accent text-lg sm:text-xl font-light tracking-[0.2em] uppercase text-white leading-none group-hover:text-gold transition-colors">
                BUILD91
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold/80 font-medium">
                Studio
              </span>
            </div>
          </Link>

          <span className="text-xs uppercase tracking-widest text-white/50 font-medium">
            Link Generator
          </span>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-8"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-2 block">
              Internal Tool
            </span>
            <h1 className="text-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Create Client Feedback Link
            </h1>
            <p className="mt-2 text-white/60 text-sm sm:text-base font-light">
              Enter the client details below to generate a pre-filled feedback URL. Share it directly via WhatsApp or Email.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/15 shadow-2xl flex flex-col gap-6">
            {/* Client Name Input */}
            <div>
              <label 
                htmlFor="clientName"
                className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-white/80 mb-2"
              >
                <User className="w-3.5 h-3.5 text-gold" />
                <span>Client Name <span className="text-gold">*</span></span>
              </label>
              <input
                id="clientName"
                type="text"
                placeholder="e.g. Aditya or Mr. Rahul Sharma"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                autoFocus
              />
            </div>

            {/* Organization Name Input (Optional) */}
            <div>
              <label 
                htmlFor="orgName"
                className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-white/80 mb-2"
              >
                <Building2 className="w-3.5 h-3.5 text-gold" />
                <span>Organization / Project Name <span className="text-white/40 lowercase font-normal">(optional)</span></span>
              </label>
              <input
                id="orgName"
                type="text"
                placeholder="e.g. Nirman Realty or Paradise Towers"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
              />
            </div>

            {/* Live Generated URL Box */}
            <div className="mt-2 pt-6 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/60 font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Generated Feedback Link:</span>
                </span>
                {isReady ? (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Ready to Share
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-medium text-white/40">
                    Requires Client Name
                  </span>
                )}
              </div>

              <div className="bg-black/60 border border-white/15 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div suppressHydrationWarning className="text-xs sm:text-sm font-mono truncate select-all">
                  {isReady ? (
                    <span className="text-white/90">{mounted ? generatedUrl : '/feedback'}</span>
                  ) : (
                    <span className="text-white/30 italic">Enter client name above to generate link...</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={handleCopy}
                  className={`py-3 px-5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    !isReady
                      ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      : copied
                      ? 'bg-emerald-500 text-ink-900 shadow-lg shadow-emerald-500/30'
                      : 'bg-gold hover:bg-gold-light text-ink-900 shadow-lg shadow-gold/20 active:scale-95 cursor-pointer'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-ink-900 stroke-[3]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Client Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!isReady}
                  onClick={handleWhatsApp}
                  className={`py-3 px-5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    !isReady
                      ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      : 'bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 active:scale-95 cursor-pointer'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              {/* Preview Link */}
              {isReady && (
                <div className="text-center mt-2">
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors"
                  >
                    <span>Open client view in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-5 text-center text-xs text-white/40 font-light">
        <p>© {new Date().getFullYear()} Build91 Studio · Internal Administrative Tools</p>
      </footer>
    </div>
  );
}
