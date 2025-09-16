// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gottagogrocery-backend.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
