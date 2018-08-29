const environments = {
  production: {
    envName: 'production',
    port: 5000,
  },
  staging: {
    envName: 'staging',
    port: 3000,
  },
};

export default environments[process.env.NODE_ENV.toLowerCase()] || environments.staging;
