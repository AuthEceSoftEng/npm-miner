/*
    file: dataset.js
    objective: this script connects to npm-miner and export the necessary properties from 
    the package.json for packages with more than X stars and more than Y downloads in order to recreate the experiments
*/

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const recipes = [];


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
reductedPackages = _.map(recipes, function(package) {
    return _.pick(package, ['name', 'keywords', 'description', 'dependencies', 'devDependencies']);
    });
    console.log(reductedPackages)
const numberOfPackages = recipes.length;
console.log(`Number of packages retrieved: ${numberOfPackages}`)
fs.writeFileSync(`output-apps-packagejson-dependencies.csv`, JSON.stringify(reductedPackages));
