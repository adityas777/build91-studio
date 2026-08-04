import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Build91 Studio (Manojava Systems Private Limited) collects, uses and protects your personal information.',
};

/* ───────────────────────────────────────────────────────────────────────
   Privacy Policy — adapted from the live-site policy at
   studio.build91.in/privacy-policy (fetched 2026-06-10), reworded for the
   studio context (e-commerce/shipping clauses from the build91.in commerce
   site dropped). Footer already links here as /privacy.

   Legal facts preserved from source: Manojava Systems Private Limited
   (Raipur), 18+ eligibility, 30-day deletion window, grievance officer
   Amit Mathur (hr@build91.in), Indian law + arbitration in Raipur.
   ─────────────────────────────────────────────────────────────────────── */

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Who We Are',
    body: (
      <p>
        Build91 Studio is operated by <strong>Manojava Systems Private
        Limited</strong>, headquartered in Raipur, Chhattisgarh, India
        (&ldquo;Build91&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). This
        policy describes how we collect, use and protect personal information
        when you use this website and our services.
      </p>
    ),
  },
  {
    title: '2. Eligibility',
    body: (
      <p>
        This website and our services are intended for users who are{' '}
        <strong>18 years of age or older</strong>. We do not knowingly collect
        personal information from anyone under 18.
      </p>
    ),
  },
  {
    title: '3. Information We Collect',
    body: (
      <>
        <p>
          <strong>Information you provide:</strong> name, contact details
          (email, phone, WhatsApp), company and role, project details and any
          other information you submit through our contact form, quote tool,
          email or WhatsApp.
        </p>
        <p>
          <strong>Information collected automatically:</strong> usage data
          gathered through cookies, log files and tracking pixels — such as
          pages visited, time on site, device and browser information — used
          to understand how the website is used and to improve it.
        </p>
      </>
    ),
  },
  {
    title: '4. How We Use Your Information',
    body: (
      <ul>
        <li>To provide our services and respond to your enquiries</li>
        <li>To prepare quotations and proposals you request</li>
        <li>To process payments and manage engagements</li>
        <li>
          To send service communications and, with your consent, marketing
          materials (you can opt out at any time)
        </li>
        <li>To comply with legal obligations</li>
      </ul>
    ),
  },
  {
    title: '5. Data Retention & Deletion',
    body: (
      <p>
        We keep personal information only as long as necessary for the
        purposes described above. You may request deletion of your personal
        data at any time; we honour verified deletion requests{' '}
        <strong>within 30 days</strong>.
      </p>
    ),
  },
  {
    title: '6. Data Sharing',
    body: (
      <p>
        We may share information with payment processors and service providers
        who help us operate (e.g. hosting, email delivery), and with
        government authorities where legally required. We do not sell your
        personal information.
      </p>
    ),
  },
  {
    title: '7. Security',
    body: (
      <p>
        We implement reasonable technical and organisational measures to
        protect your information. No method of transmission or storage is
        100% secure, however, and we cannot guarantee absolute protection
        against unauthorized access.
      </p>
    ),
  },
  {
    title: '8. Your Rights',
    body: (
      <p>
        You can request access to, correction of, or deletion of your personal
        data by writing to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    ),
  },
  {
    title: '9. Grievance Officer',
    body: (
      <p>
        For privacy concerns or grievances, contact our Grievance Officer:{' '}
        <strong>Amit Mathur</strong>,{' '}
        <a href="mailto:hr@build91.in">hr@build91.in</a>.
      </p>
    ),
  },
  {
    title: '10. Governing Law & Disputes',
    body: (
      <p>
        This policy is governed by the laws of India. Disputes are subject to
        mandatory arbitration in <strong>Raipur, India</strong>.
      </p>
    ),
  },
  {
    title: '11. Changes to This Policy',
    body: (
      <p>
        We may update this policy from time to time. The latest version is
        always available on this page; material changes will be indicated by
        the &ldquo;last updated&rdquo; date above.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-12 pt-40 md:pb-16 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page">
          <div className="max-w-3xl">
            <span className="section-eyebrow">Legal</span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Privacy{' '}
              <span className="text-accent-italic text-gradient">Policy.</span>
            </h1>
            <p className="mt-4 text-sm text-white/50">Last updated: 10 June 2026</p>
          </div>
        </div>
      </section>

      <section className="section-base section-neutral pb-28 pt-8 md:pb-36 md:pt-12">
        <div className="container-page">
          <div className="max-w-3xl space-y-12">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-display text-xl font-semibold text-white md:text-2xl">
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-white/65 [&_a]:text-violet-soft [&_a]:underline-offset-2 hover:[&_a]:text-gold [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white/85">
                  {s.body}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-display text-base font-semibold text-white">
                Questions?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Write to{' '}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-violet-soft underline-offset-2 hover:text-gold"
                >
                  {SITE.email}
                </a>{' '}
                or call {SITE.phoneDisplay}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
