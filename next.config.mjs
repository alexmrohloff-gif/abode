/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure next-auth resolves in Edge middleware (Turbopack)
  transpilePackages: ["next-auth"],
  // Vercel: optional standalone output for smaller serverless bundles
  // output: "standalone",
};

export default nextConfig;
