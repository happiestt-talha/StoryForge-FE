/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      // {
      //   source: '/ws/:path*',
      //   destination: 'ws://backend:8000/ws/:path*',
      // }
    ];
  },
};

export default nextConfig;