/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Force-trace the quote-email logo into the /api/quote serverless
    // function so readFileSync can find it at runtime on Vercel (public/
    // assets are served by the CDN and aren't otherwise bundled into
    // functions). Sent as an inline CID attachment on the quote email.
    outputFileTracingIncludes: {
      '/api/quote': ['./public/images/B91StudioLogo2.png'],
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'build91-studio-prod-portfoliobucketbucket-bsmmcecr.s3.us-east-1.amazonaws.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portfolio-collections/build91-studio-collection',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/weddings',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/360walkthrough',
        destination: '/services#virtual-experiences',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/blogs',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/my-project-53f785',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/exterior',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/bedrooms',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/kids-bedrooms',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/washrooms',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/my-project-6fa5a2',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/office',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/isometric-drawings',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/portfolio-collections/build91-studio-collection/restaurent',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/post/color-drenching-the-2025-guide',
        destination: '/blogs',
        permanent: true,
      },
      {
        source: '/profile/cb4a40ce-28e7-4fe3-8a8f-b6b0ff25166452411/profile',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/post/top-interior-design-trends-for-2025-with-realistic-3d-render-inspirations',
        destination: '/blogs',
        permanent: true,
      },
      {
        source: '/profile/build91design/profile',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/post/beyond-the-view-how-drone-cinematics-location-intelligence-are-reshaping-real-estate-sales',
        destination: '/blogs',
        permanent: true,
      },
      {
        source: '/offices',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/pricing-plans/list',
        destination: '/quote',
        permanent: true,
      },
      {
        source: '/termsconditions',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
