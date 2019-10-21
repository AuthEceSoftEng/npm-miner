const path = require('path')
const path_to_envs = path.resolve(path.join(__dirname, '..'), '.env')
require('dotenv').config({path: path_to_envs})
const cron = require('node-cron');
const bunyan = require('bunyan');
const amqp = require('amqplib');
const Promise = require('bluebird');
const _ = require('lodash')
const opts = {
    url: 'https://skimdb.npmjs.com/registry',
    requestDefaults: { "timeout" : "60000" },
  };
const npm_registry = require('nano')(opts);

const logger = bunyan.createLogger({ name: 'tracker' });
const limit = 50;
const mq = process.env.RABBIT_URL;
const q = 'analyses_queue';
let conn;
let ch;

const pm2 = require('./pm2mgt');

cron.schedule(
    '*/10 * * * *',
    function() {
        logger.info('Restart workers');
        return pm2.respawn().then(() => {
            logger.info('Connecting to npm...')
            return npm_registry.info();
        }).then(body => {
            logger.info('got database info', body);
            let total = body.doc_count;
            let totalPages = Math.ceil(total / limit);
            logger.info(`Total documents: ${total}`);
            logger.info(`Total pages: ${totalPages}`);
            let page = _.random(1, totalPages);
            logger.info(`Page: ${page}`);
            return npm_registry.list({
                include_docs: true,
                limit: limit,
                skip: (page - 1) * limit
            });
        }).then(body => {
            return amqp.connect(mq).then(connection => {
                conn = connection;
                return conn.createChannel();
            }).then(channel => {
                return Promise.map(body.rows, doc => {
                    logger.info(doc.doc.name);
                    const job = {
                        package_name: doc.doc.name
                    };
                    return Promise.all([
                        channel.assertQueue(q, {arguments: {
                            "x-message-ttl" : 540000
                        }}),
                        channel.sendToQueue(q, Buffer.from(JSON.stringify(job)))
                    ]);
                });
            }).then(() => {
                return conn.close();
            });
        }).catch(err => {
            logger.error(err);
        });
    }, {timezone: 'Europe/Athens'}
);
