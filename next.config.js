/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure we aren't mistakenly exporting a static site if we have dynamic features
    output: 'standalone',
};

module.exports = nextConfig;
