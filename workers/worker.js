path = require('path')
if(process.env.NODE_ENV === "development") {
  require('dotenv').config({path: path.resolve(process.cwd(), '.env')})
}
const amqp = require('amqplib');
const bunyan = require('bunyan');
const assert = require('assert');
const uuidv1 = require('uuid/v1');
const logger = bunyan.createLogger({ name: 'tracker' });
const mq = process.env.RABBIT_URL;
const q = 'analyses_queue';
let ch;
let db;
const npm_registry = require('nano')('https://skimdb.npmjs.com/registry');
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN}`
});
const request = require('request-promise');
const Promise = require('bluebird');
Promise.config({
    // Enable cancellation
    cancellation: true,
});
const mkdirp = require('mkdirp');
// const pid = uuidv1();
const pid = process.env.PID || process.argv[2];
const dest = `./downloads-${pid}`;
const fs = require('fs');
const targz = require('targz');
const jssa = Promise.promisifyAll(require('jssa'));
const afs = Promise.promisifyAll(require('fs'));
const glob = require('globby');
const _ = require('lodash');
const shell = require('shelljs');
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.MONGODB_URL;
console.log(url)
const dbName = 'npmminer';
const rimraf = require('rimraf');
const timeout = 50000;

MongoClient.connect(url).then((client) => {
    db = client.db(dbName);
    logger.info("Connected successfully to server");
    const collection = db.collection('packages');
    return collection.createIndex({ name : "hashed" });
}).then((result) => {
    logger.info(result);
    return amqp.connect(mq);
}).catch(err => {
    console.error(err)
    logger.error(`1: ${err}`);
}).then(conn => {
    return conn.createChannel();
}).catch(err => {
    console.error(err)
    logger.error(`1: ${err}`);
}).then(channel => {
    ch = channel;
    return ch.assertQueue(q, {durable: true, arguments: {
        "x-message-ttl" : 540000
    }});
}).catch(err => {
    console.error(err)
    logger.error(`1: ${err}`);
}).then(() => {
    ch.prefetch(1);
    return ch.consume(q, msg => {
        const job = JSON.parse(msg.content.toString());
        return work(job, ch, msg, db);
    });
}).catch(err => {
    console.error(err)
    logger.error(`1: ${err}`);
}).finally(() => {
    // db.close();
})

function createGlobbyPattern(localPath, ignores) {
    const ignoreArray = _.map(ignores, ignore => `!${localPath}/${ignore}`);
    return [`${localPath}/**/*.js`].concat(ignoreArray);
}

function work(job, channel, msg, db) {
    logger.info(`[1] Got job for package: ${job.package_name}`);
    return new Promise((resolve, reject) => {
        const package = {};
        npm_registry.get(job.package_name).then(doc => {    
            package.id = doc._id;
            package.name = doc.name;
            package.processing_date = Date.now();
            package.version = doc.versions[doc['dist-tags'].latest].version;
            package.tarball = doc.versions[doc['dist-tags'].latest].dist.tarball;
            package.dependencies = doc.versions[doc['dist-tags'].latest].dependencies;
            package.devDependencies = doc.versions[doc['dist-tags'].latest].devDependencies;
            let analysis;
            let localPath;
            let paths;
            logger.info(process.argv);
            logger.info(`[2] Retrieved from npm: ${doc._id}`);
            if(doc.name &&
                doc.name === job.package_name &&
                doc.repository &&
                doc.repository.url) {
                package.repository = doc.repository.url
                const hasGithub = new RegExp(/[\/][\/]github[\.]com[\/][a-zA-Z0-9\-]+[\/][a-zA-Z0-9\-]+/g).test(doc.repository.url)
                logger.info(`Has: ${hasGithub}`);
                if (hasGithub) {
                    package.github = {}
                    const github_repository = `https:${doc.repository.url.match(
                        /[\/][\/]github[\.]com[\/][a-zA-Z0-9\-]+[\/][a-zA-Z0-9\-]+/g
                    )[0]}`;
                    package.github.repository = github_repository;
                    let split = package.github.repository.split('/');
                    let user = split[3];
                    let reponame = split[4];
                    package.github.user = user
                    package.github.reponame = reponame
                }
                const remote_tasks = [];
                remote_tasks.push(
                    request({
                        url: `https://api.npms.io/v2/package/${package.name}`,
                        json: true
                    })
                );
                remote_tasks.push(
                    request({
                        url: `https://api.npmjs.org/downloads/point/last-month/${package.name}`,
                        json: true
                    })
                )
                if (hasGithub) {
                    remote_tasks.push(
                        octokit.repos.get({
                            owner: package.github.user,
                            repo: package.github.reponame
                        })
                    );
                }
                Promise.all(remote_tasks).then(res => {
                    const npmsio = { evaluation: res[0].evaluation, score: res[0].score }
                    const npmjs = res[1]
                    if (hasGithub) {
                        const github = res[2];
                        if (
                            github.data.html_url.includes(package.github.user) &&
                            github.data.html_url.includes(package.github.reponame)
                        ) {
                            package.github.stars = github.data.stargazers_count;
                            logger.info(`[3] Store package ${package.name} with a repo of ${github.data.stargazers_count} GitHub stars!`);
                            logger.info(`[3b] Stars ${package.github.user}/${package.github.reponame}: ${github.data.stargazers_count}`);
                        } else {
                            package.github.issue = 'github-redirect'
                        }
                    }
                    logger.info(`[4] The score is  ${npmsio.score.final}`);
                    package.npmsio_analysis = npmsio;
                    logger.info(`[6] Last 30 days downloads: ${npmjs.downloads}`);
                    package.npmjs = npmjs;
                    rimraf.sync(dest);
                    mkdirp.sync(dest);
                    const url = package.tarball;
                    logger.info(`[7] Downloading tarball from: ${url}`);
                    let filename = url.substr(url.lastIndexOf('/'));
                    const tarzball = path.join(dest, filename);
                    const targetDir = path.join(dest, filename.slice(0, -4));
                    localPath = targetDir;
                    return new Promise((resolve, reject) => {
                        request(url)
                        .pipe(fs.createWriteStream(tarzball))
                        .on('error', function(err) {
                            console.log('error 1');
                            console.log(err);
                            reject(callback());
                        })
                        .on('end', () => {
                            console.log('the end');
                        })
                        .on('finish', function() {
                            targz.decompress(
                            {
                                src: tarzball,
                                dest: targetDir
                            },
                            function(err) {
                                if (err) {
                                    console.log(err);
                                    return reject('error 2');
                                } else {
                                    console.log('Done!');
                                    return resolve('Job done!');
                                }
                            });
                        });
                    });
                }).then(() => {
                    return afs.readFileAsync(path.join(__dirname, 'ignores.json'));
                })
                .then((ignoresFile) => {
                  const json = JSON.parse(ignoresFile);
                  ignores = json.ignore;
                  return glob(createGlobbyPattern(localPath, ignores), { nodir: true });
                }).then(filepaths => {
                    paths = filepaths;
                    logger.info(`[8] Files identified: ${paths.length}`);
                    package.numOfFiles = paths.length;
                    if (path.length > 1000) {
                        return reject('More than 1000 files');
                    } else {
                        package.paths = paths;
                        const directories = _.map(paths, path => {
                            return path.split('/').length - 4;
                        });
                        package.minDirDepth = _.min(directories);
                        package.maxDirDepth = _.max(directories);
                        package.sumDirDepth = _.sum(directories);
                        return _.chain(paths)
                            .map(file => {
                                const lines = shell
                                .exec(`wc -l ${file}`, { silent: true })
                                .stdout.trim()
                                .split(' ')[0];
                                // const name = file.substring(file.indexOf('/code/') + '/code/'.length);
                                const name = file;
                                logger.info(file);
                                return {
                                name,
                                lines: parseInt(lines, 10)
                                };
                            })
                            .sumBy('lines')
                            .value();
                    }
                }).then(lines => {
                    package.numOfLines = lines;
                    if (lines > 1000000) {
                        return reject('More than 1000 files');
                    } else {
                        logger.info(`Number of lines: ${lines}`);
                        logger.info('[9] eslint analysis');
                        package.eslint = {};
                        // Wrapping it as a bluebird Promise to have the cancel() function
                        analysis = Promise.resolve(jssa.analyze_eslint(paths));
                        return Promise.race([
                            analysis,
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
                        ]);
                    }
                }).then(report => {
                    package.eslint.message = 'completed';
                    package.eslint.errorCount = report.eslint.errorCount;
                    package.eslint.warningCount = report.eslint.warningCount;
                    const typesAndCounts = _.chain(report.eslint.results)
                    .map((result) => {
                        const errorTypes = _.values(_.reduce(result.messages, (result, obj) => {
                        const type = obj.ruleId;
                        result[type] = {
                          type,
                          count: 1 + (result[type] ? result[type].count : 0),
                        };
                        return result;
                      }, {}));
                      return errorTypes;
                    })
                    .flattenDeep()
                    .groupBy('type')
                    .map((objs, key) => ({
                    'type': key,
                    'count': _.sumBy(objs, 'count') }))
                    .keyBy('type')
                    .mapValues('count')
                    .value();
                    if(_.isEmpty(typesAndCounts)) {
                        package.eslint.typesAndCounts = null;
                    } else {
                        package.eslint.typesAndCounts = typesAndCounts;
                    }
                    logger.info(typesAndCounts);
                    logger.info(report.eslint.errorCount);
                    logger.info(report.eslint.warningCount);
                    return resolve('OK');
                }).catch(err => {
                    logger.error(`2: ${err}`);
                    package.error2 = err;
                    logger.error('eslint issue');
                    analysis.cancel();
                    package.eslint.message = 'eslint-not-completed';
                    return resolve('OK');
                }).then(() => {
                    logger.info('[10] escomplex analysis');
                    package.escomplex = {};
                    analysis = Promise.resolve(jssa.analyze_escomplex(paths));
                    return Promise.race([
                        analysis,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
                    ]);
                }).then(report => {
                    package.escomplex.message = 'completed';
                    package.escomplex.tlocp = _.sumBy(
                        report.escomplex.reports,
                        o => o.aggregate.sloc.physical
                      );
                    package.escomplex.tlocl = _.sumBy(report.escomplex.reports, o => o.aggregate.sloc.logical);
                    package.escomplex.firstOrderDensity=report.escomplex.firstOrderDensity,
                    package.escomplex.changeCost=report.escomplex.changeCost,
                    package.escomplex.coreSize=report.escomplex.coreSize,
                    package.escomplex.loc=report.escomplex.loc,
                    package.escomplex.cyclomatic=report.escomplex.cyclomatic,
                    package.escomplex.effort=report.escomplex.effort,
                    package.escomplex.params=report.escomplex.params,
                    package.escomplex.maintainability=report.escomplex.maintainability,
                    logger.info(package.escomplex.tlocl);
                    return resolve('OK');
                }).catch(err => {
                    logger.error(`3: ${err}`);
                    logger.error('escomplex issue');
                    package.error3 = err;
                    analysis.cancel();
                    package.escomplex.message = 'escomplex-not-completed';
                    return resolve('OK');
                }).then(() => {
                    logger.info('[11] npm audit analysis');
                    package.npmaudit = {};
                    let pathToPackage = path.join(__dirname, localPath,'package')
                    logger.info(pathToPackage);
                    shell.exec(`npm --prefix ${pathToPackage} --package-lock-only install`, { silent: true })
                    analysis = Promise.resolve(jssa.analyze_npmaudit(pathToPackage));
                    return Promise.race([
                        analysis,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
                    ]);
                }).then(report => {
                    package.npmaudit.message = 'completed';
                    package.npmaudit.results = report.npmaudit;
                    logger.info(package.npmaudit.results.actions.length);
                    return resolve('OK');
                }).catch(err => {
                    logger.error(`4: ${err}`);
                    logger.error('npmaudit issue');
                    package.error4 = err;
                    analysis.cancel();
                    package.npmaudit.message = 'npmaudit-not-completed';
                    return resolve('OK');
                }).then(() => {
                    logger.info('[12] jsinspect analysis');
                    package.jsinspect = {};
                    analysis = Promise.resolve(jssa.analyze_jsinspect(paths));
                    return Promise.race([
                        analysis,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
                    ]);
                }).then(report => {
                    package.jsinspect.message = 'completed';
                    package.jsinspect.duplicates = report.jsinspect.length;
                    logger.info(package.jsinspect.duplicates);
                    return resolve('OK');
                }).catch(err => {
                    logger.error(`5: ${err}`);
                    logger.error('jsinspect issue');
                    package.error5 = err;
                    analysis.cancel();
                    package.jsinspect.message = 'jsinspect-not-completed';
                    return resolve('OK');
                // }).then(() => {
                //     logger.info('[12] sonarjs analysis');
                //     package.sonarjs = {};
                //     analysis = Promise.resolve(jssa.analyze_sonarjs(path.join(localPath,'package')));
                //     return Promise.race([
                //         analysis,
                //         new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
                //     ]);
                // }).then(report => {
                //     package.sonarjs.message = 'completed';
                //     package.sonarjs.issues = report.sonarjs.length;
                //     package.sonarjs.blockerCount = _.sumBy(report.sonarjs, i => (i.severity === 'BLOCKER' ? 1 : 0));
                //     package.sonarjs.criticalCount = _.sumBy(report.sonarjs, i => (i.severity === 'CRITICAL' ? 1 : 0));
                //     package.sonarjs.majorCount = _.sumBy(report.sonarjs, i => (i.severity === 'MAJOR' ? 1 : 0));
                //     package.sonarjs.minorCount = _.sumBy(report.sonarjs, i => (i.severity === 'MINOR' ? 1 : 0));
                //     package.sonarjs.infoCount = _.sumBy(report.sonarjs, i => (i.severity === 'INFO' ? 1 : 0));
                
                //     logger.info(package.sonarjs.issues);
                //     return resolve('OK');
                // }).catch(err => {
                //     logger.error(`6: ${err}`);
                //     logger.error('sonarjs issue');
                //     package.error6 = err;
                //     analysis.cancel();
                //     package.sonarjs.message = 'sonarjs-not-completed';
                //     return resolve('OK');
                }).then(() => {
                    logger.info('[13] analyses completed');
                    rimraf.sync(dest);
                    return resolve('OK');
                }).catch(err => {
                    logger.error(`7: ${err}`);
                    package.error7 = err;
                }).finally(() => {
                    channel.ack(msg);
                    const col = db.collection('packages');
                    logger.info('[14] Document upserted');
                    return col.findOneAndReplace({name: package.name}, package, { upsert: true });
                })
            } else {
                logger.info(`No repo identified`);
                package.error1 = 'no-repo-identified';
                channel.ack(msg);
                const col = db.collection('packages');
                logger.info('[15] Document upserted');
                return col.findOneAndReplace({name: package.name}, package, { upsert: true });
            }
        }).catch(err => {
            logger.error(`8: ${err}`);
            const col = db.collection('packages');
            package.error8 = err;
            logger.info('[16] Document upserted');
            return col.findOneAndReplace({name: job.package_name}, package, { upsert: true });
        });
    });
}