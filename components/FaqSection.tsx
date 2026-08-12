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
    <section className="section-base section-neutral relative overflow-hidden py-24 md:py-32 border-t border-white/5">
      <div className="container-page">
        {/* Header grid matching reference design */}
        <AnimatedSection className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
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
                      <ChevronDown
                        className={`h-5 w-5 text-white/45 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-gold' : 'group-hover:text-white'
                        }`}
                      />
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

const STATIC_FAQS: FaqItem[] = [
  {
    question: 'What Is 3D Rendering in Interior Design?',
    answer: (
      <p>
        Interior design rendering is the process of creating 2D or 3D digital models of interior spaces. These models are then enhanced with textures, lighting, and other details to create realistic visualizations of how a space will look once it’s completed. Interior rendering is an essential tool for architects, interior designers, and real estate developers to help visualize their designs and communicate their vision to clients and stakeholders.
      </p>
    ),
    keywords: 'what is 3d rendering interior design process digital models visualisations layout plans',
  },
  {
    question: 'What is the Cost of 3D Rendering Services for Interior Design?',
    answer: (
      <p>
        Please{' '}
        <Link href="/quote" className="text-gold underline hover:text-white transition-colors">
          talk to us to get a quote
        </Link>
        . Our pricing typically depends on the area required to render and the type of drawings required. We work on carpet area and a per sqft rate. There are different rate slabs. We offer 3D Interior and Exterior renders, 2D interior drawings, Pano 360° walkthroughs, cut-sections and 3D floor plans. Views and revisions are unlimited for a given design. For large projects such as townships, resorts and tall buildings - it\'s a case to case basis.
      </p>
    ),
    keywords: 'cost price rates pricing sqft carpet area rates views revisions charges quotation',
  },
  {
    question: 'How Long Do 3D Interior Design Rendering Services Take?',
    answer: (
      <p>
        The time it takes for a 3d interior design company to create renderings can vary depending on the complexity of the project and the level of detail required. Simple projects with minimal details may take 1-2 weeks, whilst more complex projects with intricate designs, customized furniture or a lack of design materials can take longer to create. Generally, factors that can affect the time it takes to complete an interior render include the number of revisions required, the size of the space, amount of customized furniture and time taken to receive feedback from the client when required.
      </p>
    ),
    keywords: 'how long time duration timeline delivery turnaround weeks feedback speed schedule',
  },
  {
    question: 'Can You Work with My Existing Designs and Ideas?',
    answer: (
      <p>
        Absolutely. We can integrate your design ideas, sketches, or blueprints to create accurate 3D renderings that align with your vision. Our team is experienced in collaborating with interior designers and clients to bring existing ideas to life.
      </p>
    ),
    keywords: 'existing designs ideas sketches blueprints drawings layouts collaboration matching integration',
  },
  {
    question: 'What If I Need Revisions?',
    answer: (
      <p>
        We understand that design is a collaborative process. We offer a structured revision process to ensure that the final renderings meet your exact expectations. Minor adjustments are usually included in our pricing, and our team will provide clear guidance on revision limits.
      </p>
    ),
    keywords: 'revisions changes edit modifications corrections revision limits adjust review process',
  },
  {
    question: 'How Do You Ensure the Renderings Are Accurate?',
    answer: (
      <p>
        Our team uses high-quality software and works closely with you to gather precise measurements, material preferences, and style details. We also offer a review stage where you can confirm that everything looks accurate before finalizing.
      </p>
    ),
    keywords: 'accuracy precise check measures material details software review quality quality check',
  },
  {
    question: 'What Makes Your Renderings Different from Competitors?',
    answer: (
      <p>
        We pride ourselves on producing photorealistic images with exceptional attention to detail. Our renderings are crafted to captivate viewers and help your spaces stand out in the market, all while providing personalized service and quick turnaround times.
      </p>
    ),
    keywords: 'difference competitors benefit stand out photorealistic speed quality personal unique',
  },
  {
    question: 'How Can 3D Renderings Help Increase My Sales?',
    answer: (
      <p>
        High-quality 3D renderings showcase your designs in a visually engaging way, making it easier for clients to envision themselves in the space. This emotional connection can lead to faster decision-making and increased sales, as clients are more likely to be drawn to realistic, detailed presentations of your work.
      </p>
    ),
    keywords: 'sales help increase lead conversion conversion speed decision making return of investment marketing',
  },
  {
    question: 'Do you also do 2D Drawings?',
    answer: (
      <p>
        Yes we do! You can get 2D elevation drawings which shows the vertical layout of a room’s features. It typically includes the overall dimensions, placement of furnishings (like the bed and side tables), wall treatments, lighting fixtures, and finish specifications (e.g., paint colors, textures, or materials). Checkout some samples in our{' '}
        <Link href="/portfolio" className="text-gold underline hover:text-white transition-colors">
          Portfolio
        </Link>
        .
      </p>
    ),
    keywords: '2d drawings elevation vertical layout dimensions furnishings materials plans samples',
  },
];
