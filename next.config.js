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
};

module.exports = nextConfig;
