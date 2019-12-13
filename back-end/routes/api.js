var express = require('express');
var router = express.Router();
const shelljs = require('shelljs');
var Promise = require("bluebird");
Promise.promisifyAll(shelljs);
const axios = require('axios');
const _ = require('lodash')
const queries = require('./queries')
const middlewares = require('./middlewares')
const redis = require("redis"), client = redis.createClient(process.env.REDIS_ADDRESS);
const {promisify} = require('util');
const setAsync = promisify(client.set).bind(client);

router.get('/search', function(req, res) {
  const query = req.query.q;
  let results = []
  shelljs.execAsync(`npm search ${query} --json`, {
    silent: true
  }).then(data => {
    results = JSON.parse(data).map(o => {
      return { name: o.name, description: o.description };
    })
    let names = _.map(JSON.parse(data), 'name')
    return req.app.locals.collection.find({name: {$in: names}}, {projection:{_id: 0, name: 1}}).toArray()
  }).then(data => {
    let names_in_db = _.map(data, 'name')
    results = _.map(results, x => names_in_db.includes(x.name) ? _.defaults(x, {crawled: true}) : _.defaults(x, {crawled: false}))
    return res.json(results);
  });
});

router.get('/stats', middlewares.checkStatsCache, function(req, res) {
  req.app.locals.collection.aggregate(
    [
      {
        '$project': {
          'deps': {
            '$cond': {
              'if': {
                '$isArray': {
                  '$objectToArray': '$dependencies'
                }
              }, 
              'then': {
                '$size': {
                  '$objectToArray': '$dependencies'
                }
              }, 
              'else': 0
            }
          }
        }
      }, {
        '$bucket': {
          'groupBy': '$deps', 
          'boundaries': [
            0, 1, 2, 3, 4, 5, 6, 7
          ], 
          'default': '>6', 
          'output': {
            'count': {
              '$sum': 1
            }
          }
        }
      }
    ]
  ).toArray().then(step1 => {
    return Promise.all([step1,
      req.app.locals.collection.aggregate(
        [
          {
            '$project': {
              'devDeps': {
                '$cond': {
                  'if': {
                    '$isArray': {
                      '$objectToArray': '$devDependencies'
                    }
                  }, 
                  'then': {
                    '$size': {
                      '$objectToArray': '$devDependencies'
                    }
                  }, 
                  'else': 0
                }
              }
            }
          }, {
            '$bucket': {
              'groupBy': '$devDeps', 
              'boundaries': [
                0, 1, 2, 3, 4, 5, 6, 7
              ], 
              'default': '>6', 
              'output': {
                'count': {
                  '$sum': 1
                }
              }
            }
          }
        ]
      ).toArray()])
    }).then(step2 => {
    return Promise.all([step2[0], step2[1], setAsync('cache:stats', JSON.stringify({dependencies: step2[0], devDependencies: step2[1]}), 'EX', 24 * 60 * 60)])
  }).then(values => res.status(200).json({dependencies: values[0], devDependencies: values[1]})).catch(error => console.error(error));
})

router.get('/dashboard', middlewares.checkDashboardCache, function(req, res) {
  let response = { loc: 0, packages: 0, top_stars: 0, packages_per_day: 0, trivial_packages: 0}
  req.app.locals.collection.aggregate([{
    $project: {
      numOfLinesExist: { 
        $cond: [
          {
            $or: [{
              $ne: ["$numOfLines", null]
            }]
          }, "$numOfLines", 0
        ]
      }
    },
  }]).toArray().then(result => {
    response.loc = _.chain(result).filter(r => !isNaN(r.numOfLinesExist)).sumBy(r => r.numOfLinesExist).value()
    return req.app.locals.collection.aggregate(queries.trivialPackages).toArray()
  }).then(result => {
    response.trivial_packages = result[0].countSimple
    return req.app.locals.collection.countDocuments()
  }).then(result => {
    response.packages = result
    const yesterday = Date.now() - 1000*60*60*24
    return req.app.locals.collection.countDocuments( { processing_date: { $gt:  yesterday} } )
  }).then(result => {
    response.packages_per_day = result
    return req.app.locals.collection.aggregate([
      {$group: {_id: '$github.repository',
                'name': {$first: '$github.repository'},
                'score': {$first: '$github.stars'},
                },
     }]).sort({score: -1}).limit(10).toArray()
  }).then(result => {
    response.top_stars = result
    return setAsync('cache:dashboard', JSON.stringify(response), 'EX', 1 * 60 * 60)
  }).then(() => {
    return res.json(response)
  }).catch(err => {
    return res.sendStatus(500)
  })
});



router.get('/packages/:package*', middlewares.checkPackageCache, function(req, res) {
// router.get('/packages/:package*', function(req, res) {
  const collection = req.app.locals.collection;
  const packageName = req.params.package;
  collection.findOne({ name: packageName }).then(response => {
    return Promise.all([response, setAsync(packageName, JSON.stringify(response), 'EX', 48 * 60 * 60)])
  }).then(values => res.status(200).json(values[0])).catch(error => console.error(error));
});

module.exports = router;
