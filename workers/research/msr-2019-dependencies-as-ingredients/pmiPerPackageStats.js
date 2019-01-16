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
const stars = 100;
const downloads = 5000;

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
            "latest_package_json.devDependencies": { $exists: true }, })
        .project({
            name: 1,
            _id: 0,
            "latest_package_json.devDependencies": 1,
            stars: 1,
            "npmsio.evaluation.popularity.downloadsCount": 1
        }).toArray();
}).then(results => {
    packages = results;
    const numberOfPackages = packages.length;
    console.log(`Number of packages retreieved: ${numberOfPackages}`);

    // Get devDependencies per package
    const deps = _.chain(packages)
        .map(package => _.keys(package.latest_package_json.devDependencies))
        .value();

    // Count the existence of a dependency in a package
    const counting = _.chain(packages)
        .map(package => _.keys(package.latest_package_json.devDependencies))
        .flatMap()
        .countBy()
        .value();
    // console.log(_.entries(counting));

    // Transform the counting to an array with a key
    const countingToArrayWithKey = _.chain(_.entries(counting))
        .map(([k,v]) => ({name: k, value: v}))
        .orderBy(['value'], ['desc'])
        // .filter(function(o) {
        //     return o['value'] > 5;
        // })
        // .slice(0,1000)
        .value();
    // console.log(countingToArrayWithKey);

    // Output the top dependencies according to count
    const top = convertArrayToCSV(countingToArrayWithKey);
    fs.writeFileSync('output-topDeps.csv', top);

    // Order the dependencies and get the names of them
    const all = _.chain(_.entries(counting))
        .map(([k,v]) => ({name: k, value: v}))
        .orderBy(['value'], ['desc'])
        // .slice(0,1000)
        .map('name')
        .value();
    // console.log(all);

    // Calculate the PMI for each pair.
    db = {}; // A database of PMI information for pairs of dependencies
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
    const edges = Object.entries(db).map(([key, value]) => {
        const nodes = key.split(';');
        const nodea = nodes[0]
        const nodeb = nodes[1]
        const pab = value / numberOfPackages;
        const pa = _.find(countingToArrayWithKey, {name: nodea }).value / numberOfPackages;
        const pb = _.find(countingToArrayWithKey, {name: nodeb }).value / numberOfPackages;
        const pmi = Math.log2(pab / (pa * pb));
        return {key, pmi}
    });
    // console.log(_.orderBy(edges, ['pmi'], ['desc']))

    // Prepare them for output in a csv file
    const pairs = _.map(edges, o =>  [o.key.split(';')[0], o.key.split(';')[1], o.pmi]);
    
    // Transform them
    dbpairs = _.chain(pairs).map(pair => {
        let pairname = (pair[0] + ';' + pair[1]);
        let pairvalue = parseFloat(pair[2]);
        return {pairname, pairvalue};
    }).keyBy('pairname').mapValues('pairvalue').value();
    // console.log(dbpairs);
    // console.log(dbpairs['async;cli-progress']);

    return converter.json2csvPromisified(pairs, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    // Write for each pair of dependencies its pmi
    fs.writeFileSync('output-pmiPerPair.csv', file);

    // Calculate stats for recipes/pairs...
    let stats = [];
    _.map(packages, package => {
        const dependencies = _.keys(package.latest_package_json.devDependencies);
        let combinations = [];
        // Since you only want pairs, there's no reason
        // to iterate over the last element directly
        for (let i = 0; i < dependencies.length - 1; i++) {
        // This is where you'll capture that last value
            for (let j = i + 1; j < dependencies.length; j++) {
                combinations.push(`${dependencies[i]};${dependencies[j]}`);
            }
        }
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
        if(combinations.length > 0) {
            const statistic = [min, max, avg, package.stars, package.npmsio.evaluation.popularity.downloadsCount];
            stats.push(statistic)
        }
    })
    return converter.json2csvPromisified(stats, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    fs.writeFileSync('output-pmiStatsPerPackage.csv', file);
}).finally(() => {
    client.close();
});