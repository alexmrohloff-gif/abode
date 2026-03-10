/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure next-auth resolves in Edge middleware (Turbopack)
  transpilePackages: ["next-auth"],
  // Skip TS check during build (often hangs on Vercel); run `npx tsc --noEmit` in CI instead
  typescript: { ignoreBuildErrors: true },
  // Vercel: optional standalone output for smaller serverless bundles
  // output: "standalone",
};

export default nextConfig;
