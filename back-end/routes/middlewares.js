const redis = require("redis"), client = redis.createClient(process.env.REDIS_ADDRESS);
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

exports.checkPackageCache = (req, res, next) => {
    const packageName = req.params.package;
    getAsync(packageName).then(function(package) {
        if (package) {
            res.status(200).json(JSON.parse(package));
        } else {
            next();
        }
    });
}

exports.checkStatsCache = (req, res, next) => {
    getAsync('cache:stats').then(function(response) {
        if (response) {
            res.status(200).json(JSON.parse(response));
        } else {
            next();
        }
    });
}

exports.checkDashboardCache = (req, res, next) => {
    getAsync('cache:dashboard').then(function(response) {
        if (response) {
            res.status(200).json(JSON.parse(response));
        } else {
            next();
        }
    });
}