var express = require('express');
var router = express.Router();
const shelljs = require('shelljs');
var Promise = require("bluebird");
Promise.promisifyAll(shelljs);
const axios = require('axios');

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

router.get('/packages/:package*', function(req, res) {
  const collection = req.app.locals.collection;
  const packageName = req.params.package;
  collection.findOne({ name: packageName }).then(response => res.status(200).json(response)).catch(error => console.error(error));
});

module.exports = router;
