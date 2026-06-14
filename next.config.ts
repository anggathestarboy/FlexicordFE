import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined, // Wajib untuk Tauri saat build produksi
  images: {
    unoptimized: true, // Wajib jika menggunakan tag <Image> dari Next.js di static export
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
