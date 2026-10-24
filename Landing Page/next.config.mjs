/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/verify',
        destination: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#verify-section`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
