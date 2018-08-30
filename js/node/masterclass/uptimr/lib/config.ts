const environments = {
  production: {
    envName: 'production',
    hashingSecret: 'secret',
    httpPort: 80,
    httpsPort: 443,
  },
  staging: {
    envName: 'staging',
    hashingSecret: 'secret',
    httpPort: 3000,
    httpsPort: 3001,
  },
};

export default environments[process.env.NODE_ENV.toLowerCase()] || environments.staging;
