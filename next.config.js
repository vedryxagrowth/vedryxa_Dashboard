// next.config.js
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(mp3|wav)$/, // Add other audio formats if needed
            type: 'asset/resource', // This handles the audio file as a separate asset
        });
        return config;
    },

};

module.exports = nextConfig;
