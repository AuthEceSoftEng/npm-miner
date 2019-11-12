var express = require('express');
var router = express.Router();
const shelljs = require('shelljs');
var Promise = require("bluebird");
Promise.promisifyAll(shelljs);
const axios = require('axios');
const _ = require('lodash')
const queries = require('./queries')

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

router.get('/stats', function(req, res) {
  req.app.locals.collection.aggregate(
    [
      {
        '$project': {
          'devDeps': {
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
  ).toArray().then(result => {
    return res.json({dependencies: result})
  });
})

router.get('/dashboard', function(req, res) {
  let loc_mined = 0
  let packages_mined = 0
  let packages_per_day = 0
  let trivial_packages = 0
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
    loc_mined = _.chain(result).filter(r => !isNaN(r.numOfLinesExist)).sumBy(r => r.numOfLinesExist).value()
    return req.app.locals.collection.aggregate(queries.trivialPackages).toArray()
  }).then(result => {
    trivial_packages = result[0].countSimple
    return req.app.locals.collection.countDocuments()
  }).then(result => {
    packages_mined = result
    const yesterday = Date.now() - 1000*60*60*24
    return req.app.locals.collection.countDocuments( { processing_date: { $gt:  yesterday} } )
  }).then(result => {
    packages_per_day = result
    return req.app.locals.collection.aggregate([
      {$group: {_id: '$github.repository',
                'name': {$first: '$github.repository'},
                'score': {$first: '$github.stars'},
                },
     }]).sort({score: -1}).limit(10).toArray()
  }).then(result => {
    return res.json({ loc: loc_mined, packages: packages_mined, top_stars: result, packages_per_day: packages_per_day, trivial_packages})
  }).catch(err => {
    return res.sendStatus(500)
  })
});



router.get('/packages/:package*', function(req, res) {
  const collection = req.app.locals.collection;
  const packageName = req.params.package;
  collection.findOne({ name: packageName }).then(response => res.status(200).json(response)).catch(error => console.error(error));
});

module.exports = router;
