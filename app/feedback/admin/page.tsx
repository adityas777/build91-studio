import type { Metadata } from 'next';
import { FeedbackAdminClient } from '@/components/FeedbackAdminClient';

export const metadata: Metadata = {
  title: 'Feedback Link Generator | Build91 Studio Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FeedbackAdminPage() {
  return <FeedbackAdminClient />;
}
