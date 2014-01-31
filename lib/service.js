/**
 * Created by invercity on 1/24/14.
 */

var async = require('async');
var config = require('./config');

//var DELTA_DISTANCE = config.get('app:deltaDistance');
var DELTA_DISTANCE = 50;
// speed - 50 km/h, will be replaced later
var SPEED = 50000/60;
// bus stop period (minutes)
var STOP = 2;

// converting to radians
var rad = function(x) {
    return x * Math.PI / 180;
};

// distance between points on map, in meters
var dist = function(a1, a2, b1, b2) {
    var R = 6371; // earth's mean radius in km
    var dLat = rad(b1 - a1);
    var dLong = rad(b2 - a2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(a1)) * Math.cos(rad(b1)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3) * 1000;
};

function Service(point, node, route, trans) {
    this.__point = point;
    this.__route = route;
    this.__node = node;
    this.__trans = trans;
};

// get info for selected point
Service.prototype.getPointInfo = function(_id, callback) {
    var __this = this;
    // result item
    var result = {
        routes: []
    };
    // find each point
    this.__point.findById(_id, function(err, point) {
        // check error
        if ((err) || (!point)) {
            callback({
                error: 'No such point error'
            });
        // check if point find
        } else if (point) {
            // check each route of point, route is route _id
            async.each(point.routes, function(routeId, callback) {
                // find each route
                __this.__route.findById(routeId, function(err, route){
                    // route not found
                    if ((err) || (!route)) {
                        result.routes.push({
                            route: routeId,
                            status: 'NOTFOUND'
                        });
                        callback();
                    }
                    else if (route) {
                        // find all trans, of this route
                       __this.trans.find({route: routeId}, function(err, all) {
                           // get index of this point in route traffic
                            var index = route.points.indexOf(_id);
                            // nearest trans
                            var near = null;
                            // check each trans, and find trans which is nearest to this station
                            async.eachSeries(all, function(trans, callback) {
                                if (!near) near = trans;
                                // check if this trans closer to station
                                else if ((index - trans.next) > (index - near.next)) near = trans;
                                callback();
                            }, function() {
                                // when nearest trans find
                                if (near) {
                                    /* from point - if trans.distance equal 0,
                                     * this means that we at the CURRENT point
                                     * if this value differ from 0, this means that
                                     * we are between CURRENT and NEXT point, value is
                                     * distance to NEXT point
                                     */
                                    var from = (trans.distance === 0) ? trans.current : trans.next;
                                    // get position of point FROM in array of route points
                                    var pos = route.points.indexOf(from);
                                    // total distance in metres
                                    var distance = 0;
                                    // node count
                                    var nodes = 0;
                                    // check if this trans BEFORE point
                                    if (pos < index) {
                                        /* We need to calculate distance between points
                                         * with positions "pos" and "index" in array
                                         * route.points; This distance saved in property Node.total
                                         * for example, distance between points 2 and 3
                                         * means length of node with index 2. That's why
                                         * distance between points will means total length
                                         * of nodes "pos" and "index-1"
                                         */
                                        // sum of nodes pos..index-1
                                        for (var x = pos; x < index - 1;x++) {
                                            nodes++;
                                            distance += route.nodes[x].total;
                                        }
                                    }
                                    // if this trans on a circle to current station
                                    else {
                                        // sum of nodes 0..index-1
                                        for (var y = 0; y < index - 1; y++) {
                                            nodes++;
                                            distance += route.nodes[y].total;
                                        }
                                        // sum of nodes pos..nodes.length
                                        for (var z = pos; z < route.nodes.length; z++) {
                                            nodes++;
                                            distance +=route.nodes[z].total;
                                        }
                                    }
                                    // at least, we will add distance to NEXT point
                                    distance += trans.distance;
                                    // time calculation (minutes)
                                    var time = distance/SPEED + nodes* STOP;
                                    result.routes.push({
                                        status: 'OK',
                                        route: routeId,
                                        title: route.title,
                                        distance: distance,
                                        time: time
                                    });
                                }
                                // if nearest trans don't found
                                else {
                                    result.routes.push({
                                        status: 'NOTRANS',
                                        route: routeId,
                                        title: route.title
                                    })
                                }
                                // finish checking
                                callback();
                            });
                        });
                    }
                })
            }, function() {
                callback(result);
            });
        }
    });
};

// update transport data in database
Service.prototype.updateTransportData = function(_id, route, lat, lng, callback) {
    var __this = this;
    // find each transport by _id
    this.__trans.findById(_id, function (err, trans) {
        if (!err) {
            // check if we find each transport
            if (trans) {
                // if position already searched
                if ((trans.current) && (trans.next)) {
                    // calculate distance between CURRENT point and current transport position
                    var length = dist(lat, lng, trans.current.lat, trans.current.lng);
                    // if we out of previous station
                    if (length > DELTA_DISTANCE) {
                        // calculate distance from current position to NEXT station
                        var left = dist(lat, lng, trans.next.lat, trans.next.lng);
                        // check if we at the NEXT station
                        if (left < DELTA_DISTANCE) {
                            // set NEXT point as CURRENT point
                            trans.current = trans.next;
                            // set distance
                            trans.distance = 0;
                            // get current route, and its points
                            __this.route.findById(route, function(err, route) {
                                if (!err) {
                                    // get the route NEXT station
                                    var index = route.points.indexOf(trans.next) + 1;
                                    index = (index === route.points.length) ? 0 : index;
                                    trans.next = route.points[index];
                                    trans.save(function(err) {
                                        // return result
                                        if (!err) callback({trans: trans});
                                        else callback({error: true});
                                    })
                                }
                            });
                        }
                        // we are between CURRENT and NEXT
                        else {
                            trans.distance = left;
                            callback({trans: trans});
                        }
                    }
                    // we are stayed at current station
                    else {
                        callback({trans: trans});
                    }
                }
                // position is not searched before
                else {
                    __this.__point.find(function(err, points){
                        if (!err) {
                            // async check each point
                            async.detect(points, function(point, callback) {
                                // calculate distance between each point and current position
                                var length = dist(point.lat, point.lng, lat, lng);
                                // if we get required point
                                if (length < DELTA_DISTANCE) callback(true);
                                else callback(false);
                            }, function(result) {
                                // there are required point
                                if (result) {
                                    // get index of result in point array, and increase it
                                    var index = points.indexOf(result) + 1;
                                    // if we get lat point - st index to 0, if other - don't change it
                                    index = (index === points.length) ? 0 : index;
                                    trans.current = result;
                                    trans.next = points[index];
                                    trans.distance = 0;
                                    // update each trans data in database
                                    trans.save(function(err) {
                                        if (!err) callback({trans: trans});
                                    });

                                }
                                else callback({error: true});
                            })
                        }
                    });
                }
            }
        }
    })
};

// add route id to each point of array of points
Service.prototype.addRouteToPoints = function(points, route, callback) {
    var __this = this;
    async.each(points, function(id, callback) {
        __this.__point.findById(id, function(err, point){
            if ((!err) && (point)) {
                point.routes.push(route);
                point.save(function() {
                    callback();
                })
            }
            else callback();
        });
    }, function() {
        if (callback) callback();
    });
};

Service.prototype.removeRouteFromPoints = function(points, route, callback) {
    var __this = this;
    async.each(points, function(id, callback) {
        __this.__point.findById(id, function(err, point){
            if ((!err) && (point)) {
                var index = point.routes.indexOf(route);
                if (index !== -1) {
                    point.routes.splice(index, 1);
                    point.save(function() {
                        callback();
                    })
                }
                else callback();
            }
            else callback();
        });
    }, function() {
        if (callback) callback();
    });
};

module.exports.Service = Service;