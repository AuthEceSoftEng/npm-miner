/*
    file: topMutualDepsForApps.js
    objective: output an edge list file of dependencies with high PMI for package.json belonging to Apps (and not packages)
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
const path = require('path');
let converter = require('json-2-csv');
const recipes = [];

let type = process.argv[2] || "";
const javascriptFolder = './data-top/javascript_packages/';
const typescriptFolder = './data-top/typescript_packages/';


fs.readdirSync(javascriptFolder, {withFileTypes: true}).forEach(file => {
    // console.log(file);
    if(!file.isDirectory) recipes.push(JSON.parse(fs.readFileSync(path.join(javascriptFolder, file))));
});
fs.readdirSync(typescriptFolder, {withFileTypes: true}).forEach(file => {
    // console.log(file);
    if(!file.isDirectory) recipes.push(JSON.parse(fs.readFileSync(path.join(typescriptFolder, file))));
});
const numberOfPackages = recipes.length;
console.log(`Number of packages retrieved: ${numberOfPackages}`)
// Get the ingredients per recipe
let ingredientsPerRecipe;
if(type === 'dev') {
    ingredientsPerRecipe = _.chain(recipes)
        .map(result => _.keys(result.devDependencies))
        .value();
} else {
    ingredientsPerRecipe = _.chain(recipes)
    .map(result => _.keys(result.dependencies))
    .value();
}
// console.log(ingredientsPerRecipe); // for debugging

// Count the ingredients appearence
let freqCount;
if(type === 'dev') {
    freqCount = _.chain(recipes)
    .map(result => _.keys(result.devDependencies))
    .flatMap()
    .countBy()
    .value();
} else {
    freqCount = _.chain(recipes)
    .map(result => _.keys(result.dependencies))
    .flatMap()
    .countBy()
    .value();
}
// console.log(_.entries(freqCount)); // for debugging

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
fs.writeFileSync(`output-top-${type}Deps-apps.csv`, top);

// Again get the top 1000 ingredients
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
console.log({top: ordered[0], bottom: ordered[ordered.length-1]})

const edgeThreshold = 6

const pairs = _.chain(edges).filter(edge => edge.pmi > edgeThreshold).map(o =>  [o.key.split(';')[0], o.key.split(';')[1]]).value();
const csvFromArrayOfObjects = convertArrayToCSV(pairs, {
    separator: ';'
});

// console.log({edges: csvFromArrayOfObjects.length});
converter.json2csvPromisified(pairs, {
        prependHeader: false,
        delimiter: {
            field: ';',
            array: ','
        }
    }).then(file => {
    fs.writeFileSync(`output-mutual-${type}Dependencies-apps.csv`, file);
});