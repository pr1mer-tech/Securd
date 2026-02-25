/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/save",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      "@react-native-async-storage/async-storage": false,
    };
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "bufferutil",
      "utf-8-validate",
    );

    return config;
  },
  serverExternalPackages: [
    "pino-pretty",
    "lokijs",
    "encoding",
    "bufferutil",
    "utf-8-validate",
    "websocket",
  ],
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "empty-module",
    },
  },
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        port: "",
        pathname: "/coins/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/trustwallet/assets/master/blockchains/**",
      },
      {
        protocol: "https",
        hostname: "xkqpczltzicnmbqvihbc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
