/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@janua/ui', '@janua/react-sdk-sdk'],
  images: {
    domains: ['images.unsplash.com', 'github.com'],
  },
}

module.exports = nextConfig