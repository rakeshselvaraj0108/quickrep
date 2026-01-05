/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Core production settings
  reactStrictMode: true,

  // ✅ Image optimization (for favicons, opengraph)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'ai.google.dev',
      },
    ],
  },

  // ✅ Experimental features (Next.js 16+)
  typedRoutes: true,      // Type-safe API routes

  // ✅ TypeScript (strict production checks)
  typescript: {
    ignoreBuildErrors: false,  // Fail on type errors
  },

  // ✅ PWA + Performance Boosters
  poweredByHeader: false,        // Hide Next.js header
  trailingSlash: false,          // Clean URLs

  // ✅ Hackathon Demo Optimizations
  output: 'standalone',          // Docker-ready deployment
  generateEtags: true,           // Better caching

  // ✅ Headers for API routes (security)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },

  // ✅ Environment variables (client-safe)
  env: {
    NEXT_PUBLIC_APP_NAME: 'QuickPrep AI Study Assistant',
    NEXT_PUBLIC_VERSION: '1.0.0-hackathon',
  },
};

export default nextConfig;
