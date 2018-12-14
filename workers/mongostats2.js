const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.MONGODB_URL;
const dbName = 'npmminer';
let db;
let client;
const _ = require('lodash');

MongoClient.connect(url, { useNewUrlParser: true }).then((aclient) => {
    client = aclient;
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    return collection.aggregate([
        {
//             $project: {
//                 numOfLinesExist: { 
//                     // $cond: 
//                     // {
//                         // [{$not: ["$numOfLines"]}, 0, "$numOfLines"]
//                         // {ne: ["$numOfLines", undefined]}
//                         // if: { numOfLines: {$exists: true }}, then: "$numOfLines", else: 0
//                     // }
//                     $cond: [{
//      $or: [{
//           $ne: ["$numOfLines", null]
//      }]
// }, "$numOfLines", 0]
//                 }
//             },
//         }
        $project: {numOfLinesExist: {$ifNull: ['$escomplex.tlocp', 0] }}}
        ,{
            $group: {
                _id: null,
                totalLinesOfCode: { $sum: "$numOfLinesExist"}
            }
            
        }
    ]).toArray();
}).then(result => {
    console.log(result);
    // _.map(result, r => console.log(r.numOfLinesExist));
    // console.log(_.chain(result).filter(r => !isNaN(r.numOfLinesExist)).sumBy(r => r.numOfLinesExist).value());
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