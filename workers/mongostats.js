const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
let db;
let client;
const _ = require('lodash');
let loc_mined;
let oldest;
let youngest;
let collection;
let top;

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    collection = db.collection('packages');
    return collection.aggregate([
        {
            $project: {
                numOfLinesExist: { 
                    // $cond: 
                    // {
                        // [{$not: ["$numOfLines"]}, 0, "$numOfLines"]
                        // {ne: ["$numOfLines", undefined]}
                        // if: { numOfLines: {$exists: true }}, then: "$numOfLines", else: 0
                    // }
                    $cond: [{
     $or: [{
          $ne: ["$numOfLines", null]
     }]
}, "$numOfLines", 0]
                }
            },
        }
        // $project: {numOfLinesExist: {$ifNull: ['$escomplex.tlocp', 0] }}}
        // ,{
        //     $group: {
        //         _id: null,
        //         totalLinesOfCode: { $sum: "$numOfLinesExist"}
        //     }
            
        // }
    ]).toArray();
}).then(result => {
    // console.log(result);
    // _.map(result, r => console.log(r.numOfLinesExist));
    loc_mined = _.chain(result).filter(r => !isNaN(r.numOfLinesExist)).sumBy(r => r.numOfLinesExist).value()
    let options = {
        limit: 1,
        sort: ['processing_date']
    }
    return collection.find({processing_date: {$exists: true}}, options).toArray();
}).then(result => {
    oldest = new Date(result[0].processing_date);
    let options = {
        limit: 1,
        sort: [['processing_date', 'desc']]
    }
    return collection.find({processing_date: {$exists: true}}, options).toArray();
}).then(result => {
    youngest = new Date(result[0].processing_date);
    let options = {
        limit: 50,
        sort: [['stars', 'desc'], ['npmsio.evaluation.popularity.downloadsCount', 'desc']]
    }
    return collection.find({$and: [
        {stars: {$exists: true}}, 
        {'npmsio.evaluation.popularity.downloadsCount': {$gte: 5000}}
        ]}, options).project({
            name: 1, 
            'npmsio.evaluation.popularity.downloadsCount': 1,
            _id: 0
        }).toArray();
}).then(result => {
    top = result;
    console.log({
        LoC_mined: loc_mined,
        oldest,
        youngest,
        top
        });
}).finally(() => {
    client.close();
})

// MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
//     client = aclient;
//     db = client.db(dbName);
//     console.log("Connected successfully to server");
//     const collection = db.collection('packages');
//     // return collection.distinct("numOfLines");
//     return collection.find( { "numOfLines" : { $not: { $type : "number" } } }, {numOfLines: 1} ).toArray();
// }).then(result => {
//     console.log(result);
// }).finally(() => {
//     client.close();
// })


// MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
//     client = aclient;
//     db = client.db(dbName);
//     console.log("Connected successfully to server");
//     const collection = db.collection('packages');
//     // return collection.distinct("numOfLines");
//     return collection.find( { $and:
//                                 [
//                                     { numOfLines: { $exists: true } }, 
//                                     // { numOfLines: { $not: {$type : "number" } } }
//                                 ]}).toArray();
// }).then(result => {
//     console.log(result);
// }).finally(() => {
//     client.close();
// })