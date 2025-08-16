/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  // Enable swc minification and other modern features
  swcMinify: true,
  // Configure i18n to support Spanish and English
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es'
  },
  // Redirect root to dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true
      }
    ];
  }
};

export default nextConfig;