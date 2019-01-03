# Commands

    pm2 start
    pm2 monit
    pm2 ls
    pm2 stop all
    pm2 logs --raw | ./node_modules/.bin/bunyan

# Issues

When npm audit fails because `npm config get registry` returns `http://repository.akera.io/` and that URL does not respond then switch with:

    npm config set registry https://registry.npmjs.org/
