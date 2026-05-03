/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages via @cloudflare/next-on-pages
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
