module.exports = {
  apps : [
    {
      name      : 'crawler',
      script    : './crawler.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ]
};
