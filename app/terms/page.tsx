import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for engaging Build91 Studio (Manojava Systems Private Limited) — quotations, deposits, usage rights, payment terms and governing law.',
  alternates: {
    canonical: '/terms',
  },
};

/* ───────────────────────────────────────────────────────────────────────
   Terms & Conditions — adapted from the live-site terms at
   studio.build91.in/termsconditions (fetched 2026-06-10). All 13 clauses
   preserved; copy lightly edited for this site's voice. Footer already
   links here as /terms.
   ─────────────────────────────────────────────────────────────────────── */

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Quotations & Deposits',
    body: (
      <p>
        Build91 provides written quotations via email or WhatsApp. A{' '}
        <strong>50% deposit is required to initiate work</strong> unless
        otherwise agreed in writing. Deposits are non-refundable upon client
        cancellation.
      </p>
    ),
  },
  {
    title: '2. Use of Services',
    body: (
      <p>
        Visuals we produce are <strong>artistic impressions</strong> and
        illustrative representations only. The final constructed or designed
        product may differ significantly from rendered visuals depending on
        the execution team.
      </p>
    ),
  },
  {
    title: '3. Ownership & Usage Rights',
    body: (
      <p>
        Build91 retains the right to use created visuals for marketing,
        portfolio and promotional purposes — including publication on our
        website and social media — except where a case-by-case agreement
        states otherwise. Original designs supplied by the client remain the
        client&rsquo;s intellectual property.
      </p>
    ),
  },
  {
    title: '4. Quotation Validity & Changes',
    body: (
      <p>
        Quotations remain valid for the duration stated on them, or{' '}
        <strong>28 days from the date of issue</strong> if unspecified. Cost
        estimates may change if the project scope evolves; we will notify you
        before proceeding. Additional requests may incur extra charges and
        affect timelines.
      </p>
    ),
  },
  {
    title: '5. Project Timelines & Client Feedback',
    body: (
      <p>
        Timelines depend on timely, accurate client feedback. While we strive
        for on-schedule delivery, <strong>deadlines are not guaranteed</strong>{' '}
        and may extend at Build91&rsquo;s sole discretion due to workload or
        unforeseen delays.
      </p>
    ),
  },
  {
    title: '6. Payment Terms',
    body: (
      <p>
        <strong>Invoices must be paid within 7 days of issue.</strong> Late
        payment or default may terminate the work contract and the
        client&rsquo;s ownership/usage rights. Build91 may pause work or
        withhold deliverables until all dues are settled.
      </p>
    ),
  },
  {
    title: '7. Third-Party Indemnity',
    body: (
      <p>
        The client agrees to indemnify Build91 against third-party claims
        related to the services provided and to materials or content supplied
        by the client.
      </p>
    ),
  },
  {
    title: '8. Use of Consultants',
    body: (
      <p>
        Build91 may engage independent consultants. The client agrees not to
        hold Build91 liable for damages arising from consultant acts or
        omissions, including intellectual-property breaches. Build91 assumes
        no liability for unauthorized data access or breaches by third
        parties.
      </p>
    ),
  },
  {
    title: '9. Disclaimer & Limitation of Liability',
    body: (
      <p>
        Visuals and deliverables are provided <strong>as-is</strong>, without
        warranties of merchantability, fitness for a particular purpose or
        non-infringement. Build91 disclaims liability for indirect,
        incidental, special, punitive or consequential damages, including lost
        profits or business interruption.
      </p>
    ),
  },
  {
    title: '10. Colour Accuracy',
    body: (
      <p>
        Build91 cannot guarantee exact colour matches between rendered visuals
        and physical materials due to display and processing variations.
      </p>
    ),
  },
  {
    title: '11. Severability & Entire Agreement',
    body: (
      <p>
        These Terms constitute the entire agreement between the parties and
        supersede all prior communications. Modifications require written
        signatures from both parties. If any provision is held invalid, the
        remaining provisions remain in effect.
      </p>
    ),
  },
  {
    title: '12. Independent Contractor Relationship',
    body: (
      <p>
        Both parties operate as independent contractors. Nothing in these
        Terms establishes a partnership, joint venture or agency relationship.
      </p>
    ),
  },
  {
    title: '13. Governing Law & Jurisdiction',
    body: (
      <p>
        These Terms are governed by the laws of India. All disputes shall be
        subject to the exclusive jurisdiction of the courts of{' '}
        <strong>Raipur, India</strong>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-8 pt-28 md:pb-12 md:pt-36">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page">
          <div className="max-w-3xl">
            <span className="section-eyebrow">Legal</span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Terms of{' '}
              <span className="text-accent-italic text-gradient">Service.</span>
            </h1>
            <p className="mt-4 text-sm text-white/50">Last updated: 10 June 2026</p>
          </div>
        </div>
      </section>

      <section className="section-base section-neutral pb-16 pt-8 md:pb-20">
        <div className="container-page">
          <div className="max-w-3xl space-y-12">
            <p className="text-base leading-relaxed text-white/65">
              These terms apply to all services provided by Build91 Studio,
              operated by <strong className="text-white/85">Manojava Systems
              Private Limited</strong>, Raipur, Chhattisgarh, India. By
              engaging our services you agree to the terms below.
            </p>

            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-display text-xl font-semibold text-white md:text-2xl">
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-white/65 [&_strong]:text-white/85">
                  {s.body}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-display text-base font-semibold text-white">
                Contact
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-violet-soft underline-offset-2 hover:text-gold"
                >
                  {SITE.email}
                </a>{' '}
                · {SITE.phoneDisplay}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
