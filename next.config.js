// next.config.js
module.exports = {
    images: {
        domains: [
            'vcmrqslmzrdyilgoglqm.supabase.co',
            'ik.imagekit.io', // Added the new domain
        ],
    },
    env: {
        IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
        IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
        IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    },
};
