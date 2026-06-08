/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@opencode-ai/sdk"],
  turbopack: {},
};

export default nextConfig;
