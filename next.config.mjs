/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/save',
                permanent: true,
            },
        ];
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false };
        config.externals.push(
            "pino-pretty",
            "lokijs",
            "encoding",
            "bufferutil",
            "utf-8-validate",
        );

        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.coingecko.com",
                port: "",
                pathname: "/coins/**",
            },
        ],
    },
};

export default nextConfig;
