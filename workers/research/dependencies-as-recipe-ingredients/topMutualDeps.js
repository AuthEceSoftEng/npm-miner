/*
    file: topMutualDeps.js
    objective: output an edge list file of dependencies with high PMI
*/

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

let type = "";

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    let project = {
        name: 1, 
        _id: 0,
        "latest_package_json.dependencies": 1,
        stars: 1,
        "npmsio.evaluation.popularity.downloadsCount": 1
    }
    if(process.argv[2] === 'dev') {
        project = {
            name: 1, 
            _id: 0,
            "latest_package_json.devDependencies": 1,
            stars: 1,
            "npmsio.evaluation.popularity.downloadsCount": 1
        }
        type = "dev";
    }
    return collection.find(
        { stars: { $gte: 70 }, "npmsio.evaluation.popularity.downloadsCount": { $gte: 5000 } })
        .project(project).toArray();
}).then(recipes => {
    // fs.writeFileSync('./dev-recipes.json', JSON.stringify(recipes));
    const numberOfPackages = recipes.length;
    console.log(`Number of packages retrieved: ${numberOfPackages}`)

    // Get the ingredients per recipe
    let ingredientsPerRecipe;
    if(type === 'dev') {
        ingredientsPerRecipe = _.chain(recipes)
            .map(result => _.keys(result.latest_package_json.devDependencies))
            .value();
    } else {
        ingredientsPerRecipe = _.chain(recipes)
        .map(result => _.keys(result.latest_package_json.dependencies))
        .value();
    }
    // console.log(ingredientsPerRecipe);

    // Count the ingredients appearence
    let freqCount;
    if(type === 'dev') {
        freqCount = _.chain(recipes)
        .map(result => _.keys(result.latest_package_json.devDependencies))
        .flatMap()
        .countBy()
        .value();
    } else {
        freqCount = _.chain(recipes)
        .map(result => _.keys(result.latest_package_json.dependencies))
        .flatMap()
        .countBy()
        .value();
    }

    // console.log(_.entries(freqCount));

    // Transform the
    const toArrayWithKey = _.chain(_.entries(freqCount))
    .map(([k,v]) => ({name: k, value: v}))
    .orderBy(['value'], ['desc'])
    // .filter(function(o) {
    //     return o['value'] > 5;
    // })
    .slice(0,1000)
    .value();
    console.log({mostFreq: toArrayWithKey[0] , lessFreq: toArrayWithKey[999], length: toArrayWithKey.length });

    const top = convertArrayToCSV(toArrayWithKey);
    fs.writeFileSync(`output-top-${type}Deps.csv`, top);

    // Again ge the top 1000 ingredients
    const top1000 = _.chain(_.entries(freqCount))
        .map(([k,v]) => ({name: k, value: v}))
        .orderBy(['value'], ['desc'])
        .slice(0,1000)
        .map('name')
        .value();

    // Calculate PMI
    db = {};
    for(let i =0, size=ingredientsPerRecipe.length; i < size; i++) {
        for(let j =0, size2=ingredientsPerRecipe[i].length; j < size2-1; j++) {
            for(let k =j+1, size3=ingredientsPerRecipe[i].length; k < size3; k++) {
                if(top1000.indexOf(ingredientsPerRecipe[i][j]) > 0 && top1000.indexOf(ingredientsPerRecipe[i][k]) > 0) {
                    let key = ingredientsPerRecipe[i][j] < ingredientsPerRecipe[i][k] ? `${ingredientsPerRecipe[i][j]};${ingredientsPerRecipe[i][k]}` : `${ingredientsPerRecipe[i][k]};${ingredientsPerRecipe[i][j]}`;
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
        const pa = _.find(toArrayWithKey, {name: nodea }).value / numberOfPackages;
        const pb = _.find(toArrayWithKey, {name: nodeb }).value / numberOfPackages;
        const pmi = Math.log2(pab / (pa * pb));
        return {key, pmi}
    });

    const ordered = _.orderBy(edges, ['pmi'], ['desc'])
    const mean = (ordered[0].pmi-ordered[ordered.length-1].pmi)/2
    console.log({top: ordered[0], bottom: ordered[ordered.length-1], mean})

    const edgeThreshold = 6

    const pairs = _.chain(edges).filter(edge => edge.pmi > edgeThreshold).map(o =>  [o.key.split(';')[0], o.key.split(';')[1]]).value();
    const csvFromArrayOfObjects = convertArrayToCSV(pairs, {
        separator: ';'
    });
    console.log({edges: csvFromArrayOfObjects.length});
    return converter.json2csvPromisified(pairs, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    })
}).then(file => {
    console.log()
    fs.writeFileSync(`output-mutual-${type}Dependencies.csv`, file);
}).finally(() => {
    client.close();
})