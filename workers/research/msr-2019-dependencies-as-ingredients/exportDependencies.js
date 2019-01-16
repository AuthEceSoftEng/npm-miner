/*
The goal of this script is to export pairs of dependencies.
*/

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');

const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
const stars = 500;
const downloads = 1000;

let db;
let client;


MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    // Retrieve all packages (name and dependencies) with more than X stars and more than Y downloads
    return collection.find(
        { stars: { $gt: stars }, "npmsio.evaluation.popularity.downloadsCount": { $gt: downloads } })
        .project({
            name: 1, 
            _id: 0,
            "latest_package_json.dependencies": 1
        }).toArray();
}).then(packages => {
    // For each package have an array with its dependencies
    const dependenciesPerPackage = _.chain(packages)
        .keyBy('name')
        .mapValues(function(o) {
            return _.keys(o.latest_package_json.dependencies);
        })
        .value();
    const edges = [];
    _.chain(dependenciesPerPackage).keys()
        .forEach(function(key) {
            edges.push(_.zip(_.times(dependenciesPerPackage[key].length, _.constant(key)), dependenciesPerPackage[key]));
        }).flattenDepth(1).value();
    const csvFromArrayOfObjects = convertArrayToCSV(edges, {
        separator: ';'
    });
    console.log(csvFromArrayOfObjects);
    fs.writeFileSync('output-dependencies.csv', csvFromArrayOfObjects);
}).finally(() => {
    client.close();
})