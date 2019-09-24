/*
    file: dataset.js
    objective: this script connects to npm-miner and export the necessary properties from 
    the package.json for packages with more than X stars and more than Y downloads in order to recreate the experiments
*/

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const fs = require('fs');

// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
const starsThreshold = 70
const downloadsThreshold = 5000
let db;
let client;

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    let project = {
        name: 1, 
        _id: 0,
        "latest_package_json": 1,
    }
    return collection.find(
        { stars: { $gte: starsThreshold }, "npmsio.evaluation.popularity.downloadsCount": { $gte: downloadsThreshold } })
        .project(project).toArray();
}).then(packages => {
    console.log(packages)
    keptFields =_.map(packages, package => _.pick(package, 'latest_package_json'));
    console.log(keptFields)
    reductedPackages = _.map(keptFields, function(package) {
        return _.pick(package.latest_package_json, ['name', 'keywords', 'description', 'dependencies', 'devDependencies']);
      });
      console.log(reductedPackages)
    const numberOfPackages = packages.length;
    console.log(`Number of packages retrieved: ${numberOfPackages}`)
    fs.writeFileSync(`output-packagejson-dependencies.csv`, JSON.stringify(reductedPackages));
}).finally(() => {
    client.close();
})