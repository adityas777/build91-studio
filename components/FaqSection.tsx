'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import Link from 'next/link';

type FaqItem = {
  question: string;
  answer: React.ReactNode;
  keywords: string;
};

// Client-side markdown link parser to translate [Text](URL) into Next.js Links
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <p>
      {parts.map((part, index) => {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const [, linkText, url] = match;
          const isInternal = url.startsWith('/');
          if (isInternal) {
            return (
              <Link key={index} href={url} className="text-gold underline hover:text-white transition-colors">
                {linkText}
              </Link>
            );
          } else {
            return (
              <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-white transition-colors">
                {linkText}
              </a>
            );
          }
        }
        return part;
      })}
    </p>
  );
}

export function FaqSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>(STATIC_FAQS);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faq');
        if (!res.ok) {
          throw new Error('S3 FAQ fetch response not OK');
        }
        const data = await res.json();
        // Only update if we successfully fetched non-empty arrays
        if (data && Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic S3 FAQs. Falling back to local copy.', err);
      }
    }
    fetchFaqs();
  }, []);

  // Filter based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(query) ||
        f.keywords.toLowerCase().includes(query)
    );
  }, [searchQuery, faqs]);

  // Expand matching items if searching
  const isSearching = searchQuery.trim().length > 0;

  return (
    <section className="section-base section-neutral relative overflow-hidden py-10 md:py-16 border-t border-white/5">
      <div className="container-page">
        {/* Header grid matching reference design */}
        <AnimatedSection className="mb-8 md:mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="section-eyebrow">FAQ</span>
            <h2 className="section-heading mt-4">
              Frequently asked{' '}
              <span className="text-accent-italic text-gradient">questions</span>
            </h2>
          </div>

          {/* Premium Search Bar */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Looking for something?"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null); // Reset single open index on search to show search highlights
              }}
              className="w-full border-b border-white/20 bg-transparent py-2.5 pl-3 pr-10 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-violet-glow/60"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-white/40" />
          </div>
        </AnimatedSection>

        {/* FAQs List */}
        <div className="mx-auto max-w-4xl space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, index) => {
              // Find matching original index to keep track of state correctly
              const originalIndex = faqs.findIndex((f) => f.question === faq.question);
              const isOpen = isSearching || openIndex === originalIndex;

              return (
                <motion.div
                  key={faq.question}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-b border-white/10 pb-5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isSearching) return; // Disable clicking to close individual during active search for best usability
                      setOpenIndex(isOpen ? null : originalIndex);
                    }}
                    disabled={isSearching}
                    className="flex w-full items-center justify-between text-left py-4 transition-colors hover:text-gold group"
                  >
                    <span className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                      {faq.question}
                    </span>
                    {!isSearching && (
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-white/10 bg-white/[0.02] text-white/50 group-hover:border-white/30 group-hover:text-white'
                      }`}>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="pt-2 pb-4 text-sm leading-relaxed text-white/65">
                          {typeof faq.answer === 'string' ? (
                            <MarkdownText text={faq.answer} />
                          ) : (
                            faq.answer
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-sm text-white/50"
            >
              No matching questions found. Try typing another keyword (e.g. "cost", "time", "revisions").
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// Local fallback — mirrors scripts/faq-backup.json (the source of truth that
// gets pushed to S3 by scripts/upload-faq-s3.mjs). Shown on first paint and
// whenever the /api/faq S3 fetch fails. Keep in sync with that JSON file.
// Answers are plain strings; MarkdownText renders them and turns any
// [label](url) into a link.
const STATIC_FAQS: FaqItem[] = [
  {
    question:
      'What happens if our architectural plans or material specs change midway through the 3D rendering process?',
    answer:
      "We know that real estate development is dynamic and plans often evolve. If structural or material changes occur after we've started drafting the 3D models, we will pause and assess the impact. Minor material tweaks (like changing a wall color or floor texture) are typically covered in our standard revision cycles. However, significant structural changes (like moving load-bearing walls or altering the building facade) may require a 'change order.' We will always communicate any adjusted timelines or nominal fees upfront so there are no surprise costs before we proceed.",
    keywords:
      'changes structural changes modifications mid-project architectural plans material changes change order revisions',
  },
  {
    question:
      'Do we receive the raw source files upon project completion, or just the final renders?',
    answer:
      'By default, our deliverables are the final, high-resolution rendered assets (JPEGs, MP4 videos, and web packages for interactive tours) ready for your marketing campaigns. The raw source files (such as 3ds Max, SketchUp, or Unreal Engine files) and proprietary 3D assets remain the intellectual property of Build91 Studio. However, if your internal team requires the source files for future modifications, we can definitely negotiate an IP handover or extended licensing agreement at the start of the project.',
    keywords:
      'source files raw files 3ds max unreal engine intellectual property IP ownership deliverables assets handover',
  },
  {
    question:
      'Can the interactive tools in your Digital Launchpad integrate with our CRM to track buyer behavior?',
    answer:
      'Yes. While our standard Digital Launchpad is delivered as a high-performing standalone web experience, we can collaborate with your IT or marketing teams to embed tracking analytics and webhooks. This means you can track valuable buyer metrics—like how long they spent on a specific floor plan, which amenities they clicked on, and direct lead captures—straight into your existing CRM (like Salesforce, Zoho, or HubSpot).',
    keywords:
      'CRM integration salesforce zoho hubspot tracking buyer behavior analytics webhooks lead capture data',
  },
  {
    question:
      'Does our sales team need specialized hardware to showcase the 3D walkthroughs to clients?',
    answer:
      'Not at all. We optimize our entire Digital Sales Suite to be universally accessible. Your interactive assets, 360° tours, and plotted developments are designed to run smoothly on standard iPads, touchscreen kiosks in your sales gallery, smart TVs, and everyday web browsers on mobile phones. If you specifically want an immersive Virtual Reality (VR) setup for your sales office, we can optimize the files for headsets like the Meta Quest, but standard devices are more than enough to close deals.',
    keywords:
      'hardware VR headsets ipads touchscreens kiosks smart tv accessibility requirements equipment setup',
  },
  {
    question:
      'Our upcoming flagship project is strictly confidential. How do you ensure data security and prevent premature leaks?',
    answer:
      'Confidentiality is a cornerstone of our workflow, especially since we work on high-stakes project launches. We routinely execute strict Non-Disclosure Agreements (NDAs) before receiving any initial CAD files or design briefs. Internally, your project data is stored on secure, access-controlled servers, and our team members are bound by legal confidentiality clauses. Furthermore, we never publish your unreleased projects on our portfolio or social media without your explicit, written consent post-launch.',
    keywords:
      'confidentiality NDA non-disclosure security data protection leaks unreleased privacy stealth mode',
  },
  {
    question:
      'We are launching a massive township in just a few weeks. Can your team scale up for high-volume asset creation on a tight deadline?',
    answer:
      "Speed is one of our core values because we understand that launch windows are unforgiving. Because we house a multidisciplinary team of 3D artists, designers, and software developers under one roof, we can parallel-process different parts of your project. While we prefer standard lead times to ensure maximum photorealism, we can allocate dedicated 'squads' to your project to accommodate aggressive go-to-market timelines for large-scale townships or multi-tower developments.",
    keywords:
      'scale capacity large projects township high volume deadline rush order fast track speed go-to-market',
  },
];
