const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
let db;
let client;
const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');
let converter = require('json-2-csv');

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    return collection.find(
        { stars: { $gt: 100 }, "npmsio.evaluation.popularity.downloadsCount": { $gt: 5000 } })
        .project({
            name: 1, 
            _id: 0,
            "latest_package_json.dependencies": 1
        }).toArray();
}).then(results => {
    const numberOfPackages = results.length;
    console.log(numberOfPackages)
    const deps = _.chain(results)
    .map(result => _.keys(result.latest_package_json.dependencies))
    .value();
    // console.log(deps);
    const temp = _.chain(results)
    .map(result => _.keys(result.latest_package_json.dependencies))
    .flatMap()
    .countBy()
    .value();
    // console.log(_.entries(temp));
    const toArrayWithKey = _.chain(_.entries(temp))
    .map(([k,v]) => ({name: k, value: v}))
    .orderBy(['value'], ['desc'])
    // .filter(function(o) {
    //     return o['value'] > 5;
    // })
    .slice(0,1000)
    .value();
    console.log(toArrayWithKey);
    const top = convertArrayToCSV(toArrayWithKey);
    fs.writeFileSync('topDeps.csv', top);
    const top1000 = _.chain(_.entries(temp))
    .map(([k,v]) => ({name: k, value: v}))
    .orderBy(['value'], ['desc'])
    .slice(0,1000)
    .map('name')
    .value();
    db = {};
    for(let i =0, size=deps.length; i < size; i++) {
        for(let j =0, size2=deps[i].length; j < size2-1; j++) {
            for(let k =j+1, size3=deps[i].length; k < size3; k++) {
                if(top1000.indexOf(deps[i][j]) > 0 && top1000.indexOf(deps[i][k]) > 0) {
                    let key = deps[i][j] < deps[i][k] ? `${deps[i][j]};${deps[i][k]}` : `${deps[i][k]};${deps[i][j]}`;
                    db[key] = (db[key] || 0.0) + 1.0;
                }
            }
        }   
    }
    // console.log(db);
    const edges = Object.entries(db).map(([key, value]) => {
        const nodes = key.split(';');
        const nodea = nodes[0]
        const nodeb = nodes[1]
        const pab = value / numberOfPackages;
        const pa = _.find(toArrayWithKey, {name: nodea }).value / numberOfPackages;
        const pb = _.find(toArrayWithKey, {name: nodeb }).value / numberOfPackages;
        const pmi = Math.log2(pab / (pa * pb));
        return {key, pmi}
    });
    console.log(_.orderBy(edges, ['pmi'], ['desc']))
    const edgeThreshold = 1
    const pairs = _.chain(edges).filter(edge => edge.pmi > 7).map(o =>  [o.key.split(';')[0], o.key.split(';')[1], o.pmi]).value();
    const csvFromArrayOfObjects = convertArrayToCSV(pairs, {
        separator: ';'
    });
    return converter.json2csvPromisified(pairs, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    fs.writeFileSync('mutual-dependencies.csv', file);
}).finally(() => {
    client.close();
})