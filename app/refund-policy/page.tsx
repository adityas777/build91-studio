import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Refund policy details for Build91 Studio — eligibility criteria, refund process, approval timeline, non-refundable items, and support channels.',
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Eligibility',
    body: (
      <>
        <p>
          Upon receiving the first final draft rendering, if you are unsatisfied with the output, we
          will send you an email notifying you that a refund is available. We will also inform you
          whether we have approved or rejected your refund request.
        </p>
        <p>
          You may be eligible for a partial refund if you decide to cancel your project or if the
          delivered work does not meet your expectations.
        </p>
        <p>
          You must submit refund requests within <strong>20 days</strong> from the completion date of
          your project.
        </p>
        <p>
          Once we approve your request, we will process the refund and credit the amount back to your
          original payment method within a specific time frame.
        </p>
      </>
    ),
  },
  {
    title: '2. Refund Process',
    body: (
      <>
        <p>To initiate a refund, please contact our dedicated customer support team:</p>
        <ul>
          <li>
            <strong>Email:</strong> <a href="mailto:studio@build91.in">studio@build91.in</a>
          </li>
          <li>
            <strong>Required Details:</strong> Clearly state the reason for your refund request and
            provide any relevant supporting documentation.
          </li>
          <li>
            <strong>Timeline:</strong> We will carefully evaluate your request and aim to respond within
            10 business days.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Refund Approval',
    body: (
      <p>
        We assess each refund request on a case-by-case basis, considering the validity of the reasons
        provided and compliance with our refund policy. If your request meets the necessary criteria, we
        will proceed with the refund process.
      </p>
    ),
  },
  {
    title: '4. Refund Amount',
    body: (
      <p>
        The specific circumstances of your case and the progress made on your project will determine the
        refund amount. Please note that we will deduct the amount corresponding to any completed work
        already delivered to you from the refund.
      </p>
    ),
  },
  {
    title: '5. Refund Method',
    body: (
      <p>
        We will issue refunds using the original payment method. Please allow <strong>7-10 business
        days</strong> for the refund to be processed and reflected in your account.
      </p>
    ),
  },
  {
    title: '6. Late or Missing Refunds (if applicable)',
    body: (
      <>
        <p>If you have not received your refund yet, please follow these steps:</p>
        <ul>
          <li>
            <strong>Check Your Bank Account:</strong> Please double-check your bank account to ensure
            that the refund has not been processed. Please allow some time for the transaction to be
            reflected.
          </li>
          <li>
            <strong>Contact Your Credit Card Company:</strong> If you made the payment using a credit
            card, contact your credit card company. Sometimes, there may be a delay in the refund
            being officially posted to your account.
          </li>
          <li>
            <strong>Contact Your Bank:</strong> Reach out to your bank and inquire about any potential
            processing time involved in posting the refund to your account.
          </li>
        </ul>
        <p>
          <strong>Still Haven&rsquo;t Received Your Refund?</strong> If you have completed the above
          steps and have not received your refund yet, please do not hesitate to contact us at{' '}
          <a href="mailto:studio@build91.in">studio@build91.in</a>. Our dedicated support team will be
          happy to assist you.
        </p>
      </>
    ),
  },
  {
    title: '7. Non-Refundable Items',
    body: (
      <p>
        Certain items or services, such as consultation fees, third-party expenses, or specific
        client-requested customizations, may not be eligible for a refund.
      </p>
    ),
  },
  {
    title: '8. Sale Items (if applicable)',
    body: (
      <p>
        Refunds are applicable only to regular-priced items. Unfortunately, sale items cannot be
        refunded.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-12 pt-40 md:pb-16 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page">
          <div className="max-w-3xl">
            <span className="section-eyebrow">Legal</span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Refund{' '}
              <span className="text-accent-italic text-gradient">Policy.</span>
            </h1>
            <p className="mt-4 text-sm text-white/50">Last updated: 10 August 2026</p>
          </div>
        </div>
      </section>

      <section className="section-base section-neutral pb-28 pt-8 md:pb-36 md:pt-12">
        <div className="container-page">
          <div className="max-w-3xl space-y-12">
            <div className="space-y-4 text-base leading-relaxed text-white/65 font-medium">
              <p>
                At Build91 Studio, we prioritize delivering exceptional architectural visualization services
                that meet and exceed our clients&rsquo; expectations. We understand that there may be
                instances where you request a refund. To ensure transparency and clarity, we have outlined
                our refund policy below.
              </p>
              <p>
                We are committed to ensuring customer satisfaction. If you find yourself in a situation
                where you require a refund, please review the following terms and conditions:
              </p>
            </div>

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
                Need Assistance?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                We understand the importance of timely refunds and strive to resolve any issues promptly.
                Your satisfaction is our priority. Contact our dedicated support team at{' '}
                <a
                  href="mailto:studio@build91.in"
                  className="text-violet-soft underline underline-offset-2 hover:text-gold"
                >
                  studio@build91.in
                </a>{' '}
                to assist you further.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
