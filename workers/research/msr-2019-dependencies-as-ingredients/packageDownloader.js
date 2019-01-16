/*
A crawler to just download packages from npm in a sequence and ask GitHub and npms.io about some stats
*/ 
const bunyan = require('bunyan');
const Promise = require('bluebird');
const _ = require('lodash')
const opts = {
    url: 'https://skimdb.npmjs.com/registry',
    requestDefaults: { "timeout" : "60000" },
  };
const npm_registry = require('nano')(opts);
const logger = bunyan.createLogger({ name: 'tracker' });
const octokit = require('@octokit/rest')();
octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN_2,
  })
const MongoClient = require('mongodb').MongoClient;
const request = require('request-promise');
// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';

const limit = 1000;
const start_page = 187;
let at_page = start_page;

logger.info('Connecting to npm and mongo')
MongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
    db = client.db(dbName);
    logger.info("Connected successfully to mongodb");
    const collection = db.collection('packages');
    npm_registry.info()
    .then(body => {
        logger.info('got database info', body);
        let total = body.doc_count;
        let totalPages = Math.ceil(total / limit);
        logger.info(`Total documents: ${total}`);
        logger.info(`Total pages: ${totalPages}`);
        const pages = _.range(start_page, totalPages+1);
        return Promise.each(pages, (page) => {
            logger.info(page);
            at_page = page;
            console.time("page");
            return npm_registry.list({
                include_docs: true,
                limit: limit,
                skip: (page - 1) * limit
            }).then(body => {
                logger.info(`Processing page with length: ${body.rows.length}`);
                let counter = 1;
                return Promise.mapSeries(body.rows, apackage => {
                    const doc = apackage.doc;
                    logger.info(`Processing package ${counter} with name: ${doc.name} at page: ${at_page}`);
                    counter++;
                    const package = {};
                    package.id = doc._id;
                    package.name = doc.name;
                    package.processing_date = Date.now();
                    package.latest_package_json = doc.versions[doc['dist-tags'].latest];
                    if(
                        doc.name &&
                        doc.repository &&
                        doc.repository.url &&
                        new RegExp(/[\/][\/]github[\.]com[\/][a-zA-Z0-9\-]+[\/][a-zA-Z0-9\-]+/g).test(doc.repository.url)
                    ) {
                        const github_repository = `https:${doc.repository.url.match(/[\/][\/]github[\.]com[\/][a-zA-Z0-9\-]+[\/][a-zA-Z0-9\-]+/g)[0]}`;
                        package.github_repository = github_repository;
                        let split = package.github_repository.split('/');
                        let user = split[3];
                        let repo = split[4];
                        const remote_tasks = [];
                        remote_tasks.push(
                            request({
                                url: `https://api.npms.io/v2/package/${package.name}`,
                                json: true
                            })
                        );
                        remote_tasks.push(
                            octokit.repos.get({
                                owner: user,
                                repo: repo
                            })
                        );  
                        remote_tasks.push(
                            Promise.delay(1000)
                        );
                        return Promise.all(remote_tasks).then(function(res) {  
                            const npmsio = res[0];
                            const github = res[1];
                            logger.info(`[1] The score is  ${npmsio.score.final}`);
                            package.npmsio = npmsio;
                            logger.info(`[2] Stars ${user}/${repo}: ${github.data.stargazers_count}`);
                            if (
                                github.data.html_url.includes(user) &&
                                github.data.html_url.includes(repo)
                            ) {
                                package.stars = github.data.stargazers_count;
                                logger.info(`[3] Store package ${package.name} with a repo of ${github.data.stargazers_count} GitHub stars!`);
                            } else {
                                package.issue = 'github-redirect'
                            }
                            const col = db.collection('packages');
                            logger.info('[4] Document upserted');
                            return col.updateOne({name: package.name}, {$set:{
                                name: package.name,
                                processing_date: package.processing_date,
                                latest_package_json: doc.versions[doc['dist-tags'].latest],
                                github_repository: package.github_repository,
                                npmsio: package.npmsio,
                                stars: package.stars,
                            }}, { upsert: true }).catch(err => {
                                logger.info(`Problem with mongo`);
                                logger.error(err);;
                            })
                        }).catch(err => {
                            logger.info(`Problem with remote calls`);
                            logger.error(err);
                            const col = db.collection('packages');
                            logger.info('Document upserted');
                            return col.updateOne({name: package.name}, {$set:{
                                name: package.name,
                                processing_date: package.processing_date,
                                latest_package_json: doc.versions[doc['dist-tags'].latest],
                                error1: 'remote-calls-error',
                            }}, { upsert: true }).catch(err => {
                                logger.info(`Problem with mongo`);
                                logger.error(err);;
                            })
                        })
                    } else {
                        logger.info(`No github repo identified`);
                        const col = db.collection('packages');
                        logger.info('Document upserted');
                        return col.updateOne({name: package.name}, {$set:{
                            name: package.name,
                            processing_date: package.processing_date,
                            latest_package_json: doc.versions[doc['dist-tags'].latest],
                            error1: 'no-github-repo-identified',
                        }}, { upsert: true }).catch(err => {
                            logger.info(`Problem with mongo`);
                            logger.error(err);;
                        })
                    }
                }).catch(err => {
                    logger.info(`Problem with parsing`);
                    logger.error(err);;
                })
            }).finally(() => {
                console.timeEnd("page");
                logger.info(`Finished page ${page}`);
            })
        }).catch(err => {
            logger.info(`Problem with connection?`);
            logger.error(err);;
        })
    });
}).catch(err => {
    logger.error(err);
}).finally(() => {
    
})

