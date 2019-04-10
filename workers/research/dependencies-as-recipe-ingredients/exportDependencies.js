/*
    file: exportDependencies.js
    objective: this script exports pairs of dependencies in a csv file for packages with more than X stars and more than Y downloads
*/

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');

const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
const stars = 70;
const downloads = 5000;
let db;
let client;

let type=""

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to the mongodb server");
    const collection = db.collection('packages');
    // Retrieve all packages (name and dependencies) with more than X stars and more than Y downloads
    let project = {
        name: 1, 
        _id: 0,
        "latest_package_json.dependencies": 1
    }
    if(process.argv[2] === 'dev') {
        project = {
            name: 1, 
            _id: 0,
            "latest_package_json.devDependencies": 1
        }
        type = "dev";
    }
    return collection.find(
        { stars: { $gt: stars }, "npmsio.evaluation.popularity.downloadsCount": { $gt: downloads } })
        .project(project).toArray();
}).then(packages => {
    // For each package (the key is the name of the package) produce an array with its dependencies
    const dependenciesPerPackage = _.chain(packages)
        .keyBy('name')
        .mapValues(function(o) {
            if(type == 'dev') {
                return _.keys(o.latest_package_json.devDependencies);
            } else {
                return _.keys(o.latest_package_json.dependencies);
            }
        })
        .value();
    // console.log(dependenciesPerPackage); // for debugging
    const dependenciesOnly = _.chain(dependenciesPerPackage)
        .filter(o => { return Object.values(o).length > 0})
        .map(o => { return Object.values(o);})
        .value()
    // console.log(dependenciesOnly); // for debugging
    const csvDepsFromArrayOfObjects = convertArrayToCSV(dependenciesOnly, {
        separator: ','
    });
    // console.log(csvDepsFromArrayOfObjects) // for debugging
    fs.writeFileSync(`output-${type}Dependencies.csv`, csvDepsFromArrayOfObjects);
    const edges = [];
    // Create all the possible pairs
    _.chain(dependenciesPerPackage).keys()
        .forEach(function(key) {
            edges.push(_.zip(_.times(dependenciesPerPackage[key].length, _.constant(key)), dependenciesPerPackage[key]));
        }).flattenDepth(1).value();
    const csvPairsFromArrayOfObjects = convertArrayToCSV(edges, {
        separator: ';'
    });
    // console.log(csvPairsFromArrayOfObjects); // for debugging
    fs.writeFileSync(`output-paired-${type}Dependencies.csv`, csvPairsFromArrayOfObjects);
}).finally(() => {
    client.close();
})