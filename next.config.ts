import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita o Turbopack inferir a raiz errada (há vários lockfiles em Desktop\claude)
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
