import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.tmdb.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',   // allows any path under that hostname
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**', // for Freepik images
      },
    ],
  },
};

export default nextConfig;
