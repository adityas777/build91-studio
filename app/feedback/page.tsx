import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FeedbackClient } from '@/components/FeedbackClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Client Feedback | Build91 Studio',
  description: 'Share your feedback on your recent project with Build91 Studio.',
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Promise<{
  client?: string;
  name?: string;
  customer?: string;
  user?: string;
  org?: string;
  organization?: string;
  project?: string;
  company?: string;
  data?: string;
  date?: string;
}>;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const clientName = (params?.client || params?.name || params?.customer || params?.user || '').trim();
  const orgName = (params?.org || params?.organization || params?.project || params?.company || params?.data || '').trim();
  const dateVal = (params?.date || '').trim();

  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <FeedbackClient
        initialClient={clientName}
        initialOrg={orgName}
        initialDate={dateVal}
      />
    </Suspense>
  );
}

