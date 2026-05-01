/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
};

export default nextConfig;
