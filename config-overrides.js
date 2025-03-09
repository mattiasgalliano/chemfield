const path = require('path');

module.exports = function override(config, env) {
  // Add polyfill for 'buffer', 'vm', 'stream', and 'crypto', but ignore 'fs'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify'),
    crypto: require.resolve('crypto-browserify'),
    fs: false, // Set 'fs' to false to avoid errors
  };

  // Return the modified config
  return config;
};
