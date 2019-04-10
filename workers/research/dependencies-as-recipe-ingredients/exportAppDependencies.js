/*
    file: exportDependencies.js
    objective: this script exports pairs of dependencies in a csv file for packages with more than X stars and more than Y downloads
*/

const _ = require('lodash');
const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');
const path = require('path');
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

const dependenciesOnly = _.chain(ingredientsPerRecipe)
    .filter(o => { return Object.values(o).length > 0})
    .map(o => { return Object.values(o);})
    .value()
// console.log(dependenciesOnly); // for debugging
const csvDepsFromArrayOfObjects = convertArrayToCSV(dependenciesOnly, {
    separator: ','
});
// console.log(csvDepsFromArrayOfObjects) // for debugging
fs.writeFileSync(`output-app-${type}Dependencies.csv`, csvDepsFromArrayOfObjects);
const edges = [];
// Create all the possible pairs
_.chain(ingredientsPerRecipe).keys()
    .forEach(function(key) {
        edges.push(_.zip(_.times(ingredientsPerRecipe[key].length, _.constant(key)), ingredientsPerRecipe[key]));
    }).flattenDepth(1).value();
const csvPairsFromArrayOfObjects = convertArrayToCSV(edges, {
    separator: ';'
});
// console.log(csvPairsFromArrayOfObjects); // for debugging
fs.writeFileSync(`output-paired-app-${type}Dependencies.csv`, csvPairsFromArrayOfObjects);