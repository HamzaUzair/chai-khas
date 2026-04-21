import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev indicator ("N" pill in the bottom-right
  // corner while `next dev` is running). It is not part of our product UI
  // and is easily confused with third-party SDK badges.
  devIndicators: false,
};

export default nextConfig;
