/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Add proper error handling for production
  onError: (err) => {
    console.error("Next.js Error:", err);
  },
};

module.exports = nextConfig;
