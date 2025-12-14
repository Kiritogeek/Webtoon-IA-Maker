/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Ignorer les modules optionnels s'ils ne sont pas installés
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'openai': false,
        'replicate': false,
        'canvas': false,
      }
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'openai': false,
        'replicate': false,
      }
    }
    return config
  },
}

module.exports = nextConfig


