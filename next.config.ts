import type { NextConfig } from "next";

const supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabasePublicUrl
  ? new URL(supabasePublicUrl).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
