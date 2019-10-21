# npm-miner

Static code analysis of the npm registry.

The `docker-compose.yml` contains the services needed by the npm-miner to work. These are:
- nginx for a web server
- rabbitmq for a worker queue
- mongodb and mongo-express for the database and a web client for it

The developed services include:
- the front-end in react
- the back-end in node
- the workers in node:
    - the crawler
    - the analyzers

All the services above are handled with `pm2` module.
