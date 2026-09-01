import type { Metadata } from 'next';
import { Jost, Cormorant_Garamond } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { SITE } from '@/lib/constants';

// Only reports from production deploys — local `npm run dev` traffic never
// hits GA. Unset NEXT_PUBLIC_GA_MEASUREMENT_ID and no script is injected.
const gaMeasurementId =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : undefined;

const jost = Jost({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'], 
  variable: '--font-jost', 
  display: 'swap' 
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  alternates: {
    canonical: '/',
  },
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  name: SITE.name,
  legalName: 'Manojava Systems Private Limited',
  url: SITE.url,
  logo: `${SITE.url}${SITE.logo}`,
  image: `${SITE.url}${SITE.logo}`,
  description: SITE.description,
  email: SITE.email,
  telephone: SITE.phone,
  address: [
    {
      '@type': 'PostalAddress',
      addressLocality: 'Raipur',
      addressRegion: 'Chhattisgarh',
      postalCode: '492001',
      streetAddress: 'Telibandha',
      addressCountry: 'IN',
    },
    {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560076',
      streetAddress: 'BTM Layout',
      addressCountry: 'IN',
    },
  ],
  sameAs: [
    SITE.social.instagram,
    SITE.social.facebook,
    SITE.social.youtube,
  ],
  priceRange: '$$$',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${cormorant.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-ink-900 text-white antialiased">
        <Navigation />
        <main className="relative">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
      {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
    </html>
  );
}
