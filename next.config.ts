import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid webpack bundling quirks with Supabase on the server (can contribute to bad chunks).
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
};

export default nextConfig;
