/**
 * Created by invercity on 01.04.14.
 */
function Utils() {

}

/*
 * [F] rad - converting to radians
 * @x - normal value
 */
Utils.rad = function(x) {
    return x * Math.PI / 180;
};

/*
 * [F] dist - distance between points on map, in meters
 * @a1 - pointA latitude
 * @a2 - pointA longitude
 * @b1 - pointB latitude
 * @b2 - pointB longitude
 */
Utils.dist = function(a1, a2, b1, b2) {
    var R = 6371; // earth's mean radius in km
    var dLat = Utils.rad(b1 - a1);
    var dLong = Utils.rad(b2 - a2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Utils.rad(a1)) * Math.cos(Utils.rad(b1)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3) * 1000;
};

/**
 * Handle Garbage Collector
 * @returns {Function}
 */
Utils.gc = function() {
    return function(req, res, next) {
        gc();
        next();
    };
};

/**
 * CORS support
 * @returns {Function}
 */
Utils.cors = function() {
    return function(req, res, next) {
        // allowed domains (F - add options)
        res.header('Access-Control-Allow-Origin', '*');
        // allowed methods
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        // allowed headers
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    };
};

module.exports.Utils = Utils;
