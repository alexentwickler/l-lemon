const crypto = require('crypto');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// Expo SDK 46 bundles the web build with webpack 4, which hashes modules with
// md4. OpenSSL 3 (Node 17 and newer) no longer offers that digest, so the build
// aborts with ERR_OSSL_EVP_UNSUPPORTED. Swapping md4 for md5 keeps `npm run web`
// working on current Node without asking anyone for a legacy-provider flag.
const createHash = crypto.createHash;
crypto.createHash = (algorithm, ...rest) =>
  createHash(algorithm === 'md4' ? 'md5' : algorithm, ...rest);

module.exports = async function (env, argv) {
  return createExpoWebpackConfigAsync(env, argv);
};
