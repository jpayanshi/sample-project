/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local images from public/ need no configuration.
    // Add Cloudinary back here once you wire up image uploads.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
