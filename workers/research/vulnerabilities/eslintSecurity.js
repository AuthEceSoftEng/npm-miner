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
        { "eslint.typesAndCounts": { $exists: true }})
        .project({
            name: 1, 
            _id: 0,
            "package.eslint.typesAndCounts": 1
        }).toArray();
}).then(results => {
    console.log(results);
}).finally(() => {
    client.close();
})