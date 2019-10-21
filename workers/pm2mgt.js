const Promise = require('bluebird');
const pm2 = Promise.promisifyAll(require('pm2'));

module.exports = {
    respawn: function() {
        return pm2.connectAsync().then(() => {
            console.log('I am connected');
        }).then(() => {
            console.log('Stop 1');
            return pm2.stopAsync("worker1");
        }).catch(err => {
            console.error(err)
        }).then(() => {
            console.log('Stop 2');
            return pm2.stopAsync("worker2");
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Stop 3');
        //     return pm2.stopAsync("worker3");
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Stop 4');
        //     return pm2.stopAsync("worker4");
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Stop 5');
        //     return pm2.stopAsync("worker5");
        }).catch(err => {
            console.error(err)
        }).then(() => {
            console.log('Start 1');
            return pm2.startAsync({
                name      : 'worker1',
                script    : './worker.js',
                gs: ['1'],
                env: {
                PID: '1',
                NODE_ENV: 'development'
                },
                env_production : {
                PID: '1',
                NODE_ENV: 'production'
                }
            });
        }).catch(err => {
            console.error(err)
        }).then(() => {
            console.log('Start 2');
            return pm2.startAsync({
                name      : 'worker2',
                script    : './worker.js',
                args: ['2'],
                env: {
                PID: '2',
                NODE_ENV: 'development'
                },
                env_production : {
                PID: '2',
                NODE_ENV: 'production'
                }
            });
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Start 3');
        //     return pm2.startAsync({
        //         name      : 'worker3',
        //         script    : './worker.js',
        //         args: ['3'],
        //         env: {
        //         PID: '3',
        //         NODE_ENV: 'development'
        //         },
        //         env_production : {
        //         PID: '3',
        //         NODE_ENV: 'production'
        //         }
        //     });
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Start 4');
        //     return pm2.startAsync({
        //         name: 'worker4',
        //         script: './worker.js',
        //         args: ['4'],
        //         env: {
        //         PID: '4',
        //         NODE_ENV: 'development'
        //         },
        //         env_production : {
        //         PID: '4',
        //         NODE_ENV: 'production'
        //         }
        //     });
        // }).catch(err => {
        //     console.error(err)
        // }).then(() => {
        //     console.log('Start 5');
        //     return pm2.startAsync({
        //         name: 'worker5',
        //         script: './worker.js',
        //         args: ['5'],
        //         env: {
        //         PID: '5',
        //         NODE_ENV: 'development'
        //         },
        //         env_production : {
        //         PID: '5',
        //         NODE_ENV: 'production'
        //         }
        //     });
        }).catch(err => {
            console.error(err)
        }).then(() => {
            return pm2.disconnectAsync();
        }).then(() => {
            console.log('I am disconnected');
        }).catch(err => {
            console.error(err)
        })
    }
}

// const pm2 = require('pm2')

// pm2.connect(function(err) {
//   if (err) {
//     console.error(err)
//     process.exit(2)
//   }
  
//   pm2.start({
//     script: 'app.js',
//   }, (err, apps) => {
//     pm2.disconnect()
//     if (err) { throw err }
//   })
// })
