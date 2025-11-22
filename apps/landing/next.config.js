/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  transpilePackages: ['@janua/typescript-sdk'],
  images: {
    domains: ['janua.dev'],
  },
}

module.exports = nextConfig
