
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      type: "asset/resource",
    });

    return config;
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/Dashboard",
        permanent: true,
      },
    ];
  },

  // Allow Vektyra to display this application inside an iframe
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://vedryxa.vercel.app;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
