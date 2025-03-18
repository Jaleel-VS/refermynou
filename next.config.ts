import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : "",
    ],
  },
};

export default nextConfig;
