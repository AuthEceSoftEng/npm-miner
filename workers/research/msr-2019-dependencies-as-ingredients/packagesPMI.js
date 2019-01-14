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
let Combinatorics = require('js-combinatorics');
let dbpairs;
let packages;

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    return collection.find(
        { stars: { $gt: 10 }, "npmsio.evaluation.popularity.downloadsCount": { $gt: 1000 } })
        .project({
            name: 1, 
            _id: 0,
            "latest_package_json.dependencies": 1,
            stars: 1,
            "npmsio.evaluation.popularity.downloadsCount": 1
        }).toArray();
}).then(results => {
    packages = results;
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
    // .slice(0,1000)
    .value();
    // console.log(toArrayWithKey);
    const top = convertArrayToCSV(toArrayWithKey);
    fs.writeFileSync('deps.csv', top);
    const all = _.chain(_.entries(temp))
    .map(([k,v]) => ({name: k, value: v}))
    .orderBy(['value'], ['desc'])
    // .slice(0,1000)
    .map('name')
    .value();
    db = {};
    for(let i =0, size=deps.length; i < size; i++) {
        for(let j =0, size2=deps[i].length; j < size2-1; j++) {
            for(let k =j+1, size3=deps[i].length; k < size3; k++) {
                if(top.indexOf(deps[i][j]) >= 0 && top.indexOf(deps[i][k]) >= 0) {
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
    // const pairs = _.chain(edges).filter(edge => edge.pmi > 8).map(o =>  [o.key.split(';')[0], o.key.split(';')[1], o.pmi]).value();
    const pairs = _.chain(edges).filter(edge => edge.pmi > 0).map(o =>  [o.key.split(';')[0], o.key.split(';')[1], o.pmi]).value();
    const csvFromArrayOfObjects = convertArrayToCSV(pairs, {
        separator: ';'
    });
    
    dbpairs = _.chain(pairs).map(pair => {
        let pairname = (pair[0] + ';' + pair[1]);
        let pairvalue = parseFloat(pair[2]);
        return {pairname, pairvalue};
    }).keyBy('pairname').mapValues('pairvalue').value();
    console.log(dbpairs);
    console.log(dbpairs['async;cli-progress']);
    // console.log(csvFromArrayOfObjects);
    return converter.json2csvPromisified(pairs, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    fs.writeFileSync('dependencies-pmi.csv', file);
    let stats = [];
    _.map(packages, package => {
        const dependencies = _.keys(package.latest_package_json.dependencies);
        let combinations = [];
        // Since you only want pairs, there's no reason
        // to iterate over the last element directly
        for (let i = 0; i < dependencies.length - 1; i++) {
        // This is where you'll capture that last value
            for (let j = i + 1; j < dependencies.length; j++) {
                combinations.push(`${dependencies[i]};${dependencies[j]}`);
            }
        }
        console.log(combinations);
        let min = 100;
        let max = 0;
        let sum = 0;
        for (let i = 0; i < combinations.length; i++) {
            const pmic = dbpairs[combinations[i]] || 0
            console.log(pmic)
            if(pmic < min) {
                min = pmic;
            }
            if(pmic > max) {
                max = pmic;
            }
            sum += pmic;
        }
        let avg = sum / combinations.length;
        console.log({min, max, avg, stars: package.stars, downloads: package.npmsio.evaluation.popularity.downloadsCount })
        if(combinations.length > 0) {
            const statistic = [min, max, avg, package.stars, package.npmsio.evaluation.popularity.downloadsCount];
            stats.push(statistic)
        }
    })
    const csvFromArrayOfObjects = convertArrayToCSV(stats, {
        separator: ';'
    });
    return converter.json2csvPromisified(stats, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    fs.writeFileSync('stats.csv', file);
}).finally(() => {
    client.close();
});