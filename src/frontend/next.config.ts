import type { NextConfig } from "next";

// A template PDF may be up to 15 MB; the rest is the multipart overhead.
const UPLOAD_LIMIT = "16mb";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: UPLOAD_LIMIT },
    proxyClientMaxBodySize: UPLOAD_LIMIT,
  },
};

export default nextConfig;
