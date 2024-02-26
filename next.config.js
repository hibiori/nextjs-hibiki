const { VERCEL_URL, HOTPEPPER_API_KEY } = process.env;

module.exports = {
  reactStrictMode: true,

  publicRuntimeConfig: {
         API_HOST: VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3000',
       },
       serverRuntimeConfig: {
         HOTPEPPER_API_KEY,
       },
};
