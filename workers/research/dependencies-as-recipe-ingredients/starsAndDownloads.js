/*
    file: pmiPerDepStats.js
    objective: calculates min, max and avg PMI for each pair
*/
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');
let converter = require('json-2-csv');

// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
const stars = -1;
const downloads = -1;

let db;
let client;
let dbpairs;
let packages;


MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    // Retrieve all packages (name and dependencies) with more than X stars and more than Y downloads, while has dependencies as well
    return collection.find(
        { 
            stars: { $gt: stars }, 
            "npmsio.evaluation.popularity.downloadsCount": { $gt: downloads }, 
            "latest_package_json.dependencies": { $exists: true }, })
        .project({
            name: 1,
            _id: 0,
            "latest_package_json.dependencies": 1,
            stars: 1,
            "npmsio.evaluation.popularity.downloadsCount": 1
        }).toArray();
}).then(results => {
    packages = results;
    const numberOfPackages = packages.length;
    console.log(`Number of packages retreieved: ${numberOfPackages}`);
    let stats = [];
    _.forEach(packages, package => {
        const statistic = [package.stars, package.npmsio.evaluation.popularity.downloadsCount];
        stats.push(statistic)
    });
    return converter.json2csvPromisified(stats, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    fs.writeFileSync('output-star-downs.csv', file);
}).finally(() => {
    client.close();
});