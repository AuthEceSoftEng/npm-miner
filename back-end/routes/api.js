var express = require('express');
var router = express.Router();
const shelljs = require('shelljs');
var Promise = require("bluebird");
Promise.promisifyAll(shelljs);
const axios = require('axios');
const _ = require('lodash')

router.get('/search', function(req, res) {
  console.log(req.query.q)
  const query = req.query.q;
  shelljs.execAsync(`npm search ${query} --json`, {
    silent: true
  }).then(data => {
    return res.json(JSON.parse(data).map(o => {
      return { name: o.name, description: o.description };
    }));
  });
});

router.get('/dashboard', function(req, res) {
  let loc_mined = 0
  let packages_mined = 0
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
    return req.app.locals.collection.countDocuments()
  }).then(result => {
    packages_mined = result
    return req.app.locals.collection.find(
      {},
      {
        sort: [['stars', -1]],
        projection: {name: 1, stars: 1},
        limit: 10
      }
    ).toArray()
  }).then(result => {
    return res.json({ loc: loc_mined, packages: packages_mined, top_stars: result })
  }).catch(err => {
    console.error(err)
    return res.sendStatus(500)
  })
});



router.get('/packages/:package*', function(req, res) {
  const collection = req.app.locals.collection;
  const packageName = req.params.package;
  collection.findOne({ name: packageName }).then(response => res.status(200).json(response)).catch(error => console.error(error));
});

module.exports = router;
