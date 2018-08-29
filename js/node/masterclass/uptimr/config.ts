const environments = {
  production: {
    envName: 'production',
    httpPort: 80,
    httpsPort: 443,
  },
  staging: {
    envName: 'staging',
    httpPort: 3000,
    httpsPort: 3001,
  },
};

export default environments[process.env.NODE_ENV.toLowerCase()] || environments.staging;
