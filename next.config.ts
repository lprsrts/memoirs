import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/ag/ep01",
        destination: "https://mybinder.org/v2/gh/lprsrts/albert-gaussian/main?urlpath=voila%2Frender%2Fep01-friends-music%2Fnotebook.ipynb",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
