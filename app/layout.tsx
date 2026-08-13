import type { Metadata } from 'next';
import { Commissioner, Jost, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { SITE } from '@/lib/constants';

const inter = Commissioner({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const space = Jost({ subsets: ['latin'], weight: ['500'], variable: '--font-space', display: 'swap' });

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({ subsets: ['latin'], weight: ['500'], variable: '--font-jost', display: 'swap' });
const commissioner = Commissioner({ subsets: ['latin'], variable: '--font-commissioner', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'real estate marketing',
    '3D visualization',
    'architectural rendering',
    'virtual tours',
    'project microsite',
    'real estate video',
    'Build91 Studio',
    'Bengaluru',
    'Raipur',
  ],
  openGraph: {
    type: 'website',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: SITE.logo }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.logo],
  },
  icons: {
    icon: SITE.logo,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${space.variable} ${cormorant.variable} ${jost.variable} ${commissioner.variable}`}
    >
      <body className="min-h-screen bg-ink-900 text-white antialiased">
        <Navigation />
        <main className="relative">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
