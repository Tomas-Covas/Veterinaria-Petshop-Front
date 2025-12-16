import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'example.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'xyz.supabase.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'hxjxhchzberrthphpsvo.supabase.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;
