const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
let db;
let client;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    // Retrieve all packages (name and dependencies) with more than X stars and more than Y downloads
    return collection.find(
        { stars: { $gt: 500 }, "npmsio.evaluation.popularity.downloadsCount": { $gt: 10000 } })
        .project({
            name: 1, 
            _id: 0,
            "latest_package_json.dependencies": 1
        }).toArray();
}).then(results => {
    //
    const temp = 
        _.chain(results)
        .keyBy('name')
        .mapValues(function(o) {
            return _.keys(o.latest_package_json.dependencies);
        })
        .value();
        const tempPairs = [];
    _.chain(temp).keys()
        .forEach(function(key) {
            tempPairs.push(_.zip(_.times(temp[key].length, _.constant(key)), temp[key]));
        }).value();
    const pairs = _.flattenDepth(tempPairs, 1);
    const csvFromArrayOfObjects = convertArrayToCSV(pairs, {
        separator: ';'
    });
    fs.writeFileSync('dependencies.csv', csvFromArrayOfObjects);
}).finally(() => {
    client.close();
})