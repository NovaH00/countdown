import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    localPatterns: [
      { pathname: "/logos/**" },
    ],
  },
};

export default nextConfig;
