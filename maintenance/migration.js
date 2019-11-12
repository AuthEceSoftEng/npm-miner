path = require('path')
if(process.env.NODE_ENV === "development") {
  require('dotenv').config({path: path.resolve(process.cwd(), '.env')})
}

const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = process.env.PRODUCTION_MONGODB_URL;
console.log(url)
const dbName = 'npmminer';

MongoClient.connect(url, { useUnifiedTopology: true }).then((client) => {
    db = client.db(dbName);
    console.log("Connected successfully to server");
    const collection = db.collection('packages');
    return collection.updateMany(
        {latest_package_json : {$exists : true}},
        [
            {"$set": {"dependencies": "$latest_package_json.dependencies", "devDependencies": "$latest_package_json.devDependencies"}}
        ]
    )
}).then(() => {
    const collection = db.collection('packages');
    return collection.updateMany(
        {npmsio : {$exists : true}},
        [
            {"$set": {"npmsio_analysis": {"score" : "$npmsio.score", "evaluation": "$npmsio.evaluation", "analyzedAt":"$npmsio.analyzedAt"}}}
        ]
    )
}).then(() => {
    const collection = db.collection('packages');
    return collection.updateMany(
        {github_repository : {$exists : true}},
        [
            {"$set": {"github": {"repository" : "$github_repository", "stars": "$stars"}}}
        ]
    )
}).catch(err => {
    console.error(err)
    // remove null fields
}).finally(() => {
    // db.close();
    console.log("Done")
    process.exit()
})