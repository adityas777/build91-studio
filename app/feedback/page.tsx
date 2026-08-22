import type { Metadata } from 'next';
import { FeedbackClient } from '@/components/FeedbackClient';

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
  org?: string;
  organization?: string;
  project?: string;
  date?: string;
}>;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const clientName = params.client || params.name || '';
  const orgName = params.org || params.organization || params.project || '';
  const dateVal = params.date || '';

  return (
    <FeedbackClient
      initialClient={clientName}
      initialOrg={orgName}
      initialDate={dateVal}
    />
  );
}
