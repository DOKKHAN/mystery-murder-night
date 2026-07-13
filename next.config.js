/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Mantenemos el build simple para este proyecto; el linting se puede
    // correr aparte con `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
