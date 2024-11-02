/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Add these for better error handling
  onError: (err) => {
    console.error("Next.js build error:", err);
  },
  experimental: {
    // Enable React strict mode
    reactStrictMode: true,
    // Improve error handling
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
