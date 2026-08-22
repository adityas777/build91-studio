import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description:
    'Shipping and digital delivery policy for Build91 Studio — electronic transfer methods, timelines, revisions, storage access, and support channels.',
  alternates: {
    canonical: '/shipping-policy',
  },
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Shipping Policy Overview',
    body: (
      <p>
        Build91 Studio provides digital interior rendering and design services, including 3D Renders,
        Walkthrough Videos, Mood Boards & Color Palettes, 2D Architectural Drawings (Floor Plans +
        Layout Detailing), Plumbing Drawings, Electrical Drawings, Ceiling Plans (Lighting, AC, Fan
        Layouts), 2D Wall Elevations, Mechanical HVAC, and Material/Finish Specification Sheets.
        As our services are delivered digitally, no physical shipping is involved.
      </p>
    ),
  },
  {
    title: '2. Delivery Methods',
    body: (
      <>
        <p>All deliverables are provided electronically via the following methods:</p>
        <ul>
          <li>
            <strong>Email:</strong> High-resolution files and documents are sent as attachments
            or downloadable links.
          </li>
          <li>
            <strong>Online File Sharing Portals:</strong> Secure platforms (e.g., Google Drive,
            Dropbox, or similar) are used for sharing larger files or project folders.
          </li>
          <li>
            <strong>WhatsApp:</strong> Smaller files or previews may be shared via WhatsApp for
            quick communication and review.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Delivery Timeline',
    body: (
      <ul>
        <li>
          <strong>Standard Delivery:</strong> Deliverables are typically provided within the
          agreed-upon project timeline, which varies based on the scope and complexity of the service
          (e.g., 3-7 business days for standard 3D renders or 2D drawings).
        </li>
        <li>
          <strong>Rush Delivery:</strong> Expedited delivery options are available upon request,
          subject to additional fees and availability. Contact us for specific timelines.
        </li>
        <li>
          <strong>Revisions:</strong> If revisions are required, updated files will be delivered
          within 1-3 business days, depending on the nature of the changes.
        </li>
      </ul>
    ),
  },
  {
    title: '4. Communication',
    body: (
      <p>
        We primarily use Email and/or WhatsApp (or any preferred channel by clients) for project
        updates, feedback, and coordination. Clients will receive regular updates on project progress
        and delivery status.
      </p>
    ),
  },
  {
    title: '5. File Formats',
    body: (
      <>
        <p>Deliverables are provided in industry-standard formats, including but not limited to:</p>
        <ul>
          <li>
            <strong>3D Renders:</strong> JPEG, PNG, or PDF (4K or 8K or as required).
          </li>
          <li>
            <strong>2D Drawings & Plans:</strong> PDF, DWG, or other requested formats.
          </li>
          <li>
            <strong>Mood Boards & Specification Sheets:</strong> PDF or image formats.
          </li>
        </ul>
        <p>Clients may request specific formats during the project setup.</p>
      </>
    ),
  },
  {
    title: '6. Access and Storage',
    body: (
      <>
        <p>
          Files shared via online portals will remain accessible for 30 days after delivery unless
          otherwise specified.
        </p>
        <p>
          Clients are responsible for downloading and storing files promptly. Build91 is not liable
          for files removed from portals after the access period expires.
        </p>
        <p>
          For long-term storage or re-access, contact us to arrange retrieval (additional fees may
          apply).
        </p>
      </>
    ),
  },
  {
    title: '7. Issues or Non-Delivery',
    body: (
      <>
        <p>If you experience issues accessing files or do not receive your deliverables:</p>
        <ul>
          <li>
            Contact us via email (<a href="mailto:contact@build91.in">contact@build91.in</a>) or
            WhatsApp (<a href={`https://wa.me/917880147772`} target="_blank" rel="noopener noreferrer">+91 788 014 7772</a>) within 7 days of the expected delivery
            date.
          </li>
          <li>We will investigate and resend files or provide alternative access promptly.</li>
        </ul>
      </>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-8 pt-28 md:pb-12 md:pt-36">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page">
          <div className="max-w-3xl">
            <span className="section-eyebrow">Legal</span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Delivery &{' '}
              <span className="text-accent-italic text-gradient">Shipping Policy.</span>
            </h1>
            <p className="mt-4 text-sm text-white/50">Last updated: 10 August 2026</p>
          </div>
        </div>
      </section>

      <section className="section-base section-neutral pb-16 pt-8 md:pb-20">
        <div className="container-page">
          <div className="max-w-3xl space-y-12">
            <p className="text-base leading-relaxed text-white/65 font-medium">
              Build91 is committed to ensuring timely and secure delivery of all digital services to meet your project needs.
            </p>

            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-display text-xl font-semibold text-white md:text-2xl">
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-white/65 [&_a]:text-violet-soft [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white/85">
                  {s.body}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-display text-base font-semibold text-white">
                Questions or issues?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Email us at{' '}
                <a
                  href="mailto:contact@build91.in"
                  className="text-violet-soft underline underline-offset-2 hover:text-gold"
                >
                  contact@build91.in
                </a>{' '}
                or WhatsApp us at{' '}
                <a
                  href={`https://wa.me/917880147772`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-soft underline underline-offset-2 hover:text-gold"
                >
                  +91 788 014 7772
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
