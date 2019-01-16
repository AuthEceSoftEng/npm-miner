/*
    Calculates min, max and avg PMI for each pair
*/
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');
let converter = require('json-2-csv');

// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
const stars = 0;
const downloads = 0;

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
            "latest_package_json": { $exists: true },
        })
        .project({
            name: 1,
            _id: 0,
            "latest_package_json.dependencies": 1,
            stars: 1,
            "npmsio.evaluation.popularity.downloadsCount": 1
        }).toArray();
}).then(results => {
    counter1 = 0
    counter6 = 0
    counterAll = 0
    _.forEach(results, result => {
        if(result.latest_package_json) {
            if(_.keys(result.latest_package_json.dependencies).length >= 1) counter1++;
            if(_.keys(result.latest_package_json.dependencies).length >= 6) counter6++;
            counterAll++;
        }
    })
    console.log({length: counterAll, depgte1: counter1/counterAll, depgte6: counter6/counterAll })
}).finally(() => {
    client.close();
});