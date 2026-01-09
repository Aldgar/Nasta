import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production builds to succeed even if the Next type worker
  // generates transient dev-only types that reference non-existent files.
  // We still have strict type checking in-editor and during dev.
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
