/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow development origins for local testing
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.0.123',
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.0.123:3000',
  ],
};

module.exports = nextConfig;
