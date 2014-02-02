/**
 * Created by invercity on 1/24/14.
 */

var async = require('async');

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
    this.__point.findById(_id, function(err,currentPoint) {
        // check error
        if ((err) || (!currentPoint)) {
            callback({
                error: 'No such point error'
            });
        // check if point find
        } else if (currentPoint) {
            // check each route of point, route is route _id
            async.each(currentPoint.routes, function(routeId, callback) {
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
                        // get index of this point in route traffic
                        var currentPointPosition = route.points.indexOf(_id);
                        // find all trans, of this route
                       __this.__trans.find({route: routeId}, function(err, allTransport) {
                            // nearest trans
                            var nearTransport = null;
                            // check each trans, and find trans which is nearest to this station
                            async.eachSeries(allTransport, function(transport, callback) {
                                // if near not selected before, set current trans as near
                                if (!nearTransport) nearTransport = transport;
                                else {
                                    // check if this trans closer to station
                                    // find each transport index
                                    var transportIndex = route.points.indexOf(transport.next._id);
                                    // find index of currently nearest transport
                                    var currentNearIndex = route.points.indexOf(nearTransport.next._id);
                                    // check if currentTransport closer to currentStation
                                    if ((transportIndex <= currentPointPosition) && (transportIndex > currentNearIndex))
                                        nearTransport = transport;
                                }
                                callback();
                            }, function() {
                                // when nearest trans find
                                if (nearTransport) {
                                    /* from point - if trans.distance equal 0,
                                     * this means that we at the CURRENT point
                                     * if this value differ from 0, this means that
                                     * we are between CURRENT and NEXT point, value is
                                     * distance to NEXT point
                                     */
                                    var from = (nearTransport.distance === 0) ? nearTransport.current._id : nearTransport.next._id;
                                    // get position of point FROM in array of route points
                                    var fromPointPosition = route.points.indexOf(from);
                                    // total distance in metres
                                    var distance = 0;
                                    // node count
                                    var nodes = 0;
                                    // check if this trans BEFORE point
                                    if (fromPointPosition <= currentPointPosition) {
                                        /* We need to calculate distance between points
                                         * with positions "pos" and "index" in array
                                         * route.points; This distance saved in property Node.total
                                         * for example, distance between points 2 and 3
                                         * means length of node with index 2. That's why
                                         * distance between points will means total length
                                         * of nodes "pos" and "index-1"
                                         */
                                        // sum of nodes pos..index-1
                                        for (var x = fromPointPosition; x < currentPointPosition; x++) {
                                            nodes++;
                                            distance += route.nodes[x].total;
                                        }
                                    }
                                    // if this trans on a circle to current station
                                    else {
                                        // sum of nodes 0..index-1
                                        for (var y = 0; y < currentPointPosition - 1; y++) {
                                            nodes++;
                                            distance += route.nodes[y].total;
                                        }
                                        // sum of nodes pos..nodes.length
                                        for (var z = fromPointPosition; z < route.nodes.length; z++) {
                                            nodes++;
                                            distance +=route.nodes[z].total;
                                        }
                                    }
                                    // at least, we will add distance to NEXT point
                                    distance += nearTransport.distance;
                                    // time calculation (minutes)
                                    var time = distance/SPEED + nodes* STOP;
                                    result.routes.push({
                                        status: 'OK',
                                        route: routeId,
                                        title: route.title,
                                        distance: distance,
                                        time: time.toFixed(0)
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
Service.prototype.updateTransportData = function(_id, routeId, lat, lng, callback) {
    var __this = this;
    // find each transport by _id
    this.__trans.findById(_id, function (err, currentTrans) {
        // check if we find each transport
        if ((!err) && (currentTrans)) {
            // find selected route
            __this.__route.findById(routeId, function(err, currentRoute) {
               if ((!err) && (currentRoute)) {
                   // set route
                   currentTrans.route = routeId;
                   // update latitude
                   currentTrans.lat = lat;
                   // update longitude
                   currentTrans.lng = lng;
                   // if position already searched
                   if ((currentTrans.current._id) && (currentTrans.next._id)) {
                       // calculate distance between CURRENT point and current transport position
                       var length = dist(lat, lng, currentTrans.current.lat, currentTrans.current.lng);
                       // if we out of previous station
                       if (length > DELTA_DISTANCE) {
                           // calculate distance from current position to NEXT station
                           var left = dist(lat, lng, currentTrans.next.lat, currentTrans.next.lng);
                           // check if we at the NEXT station
                           if (left < DELTA_DISTANCE) {
                               // set NEXT point as CURRENT point
                               currentTrans.current = currentTrans.next;
                               // set distance
                               currentTrans.distance = 0;
                               // get index of NEXT point in array route.points
                               async.detect(currentRoute.points, function(point, callback) {
                                   if (point.toString() === currentTrans.next._id.toString()) callback(true);
                                   callback(false);
                               }, function(nextPoint) {
                                   // if there are such point
                                   if (nextPoint) {
                                       // get index of NEXT.next point
                                       var index = currentRoute.points.indexOf(nextPoint) + 1;
                                       // WILL BE DECREASED (done)
                                       index = (index === currentRoute.points.length - 1) ? 0 : index;
                                       // find this point in db
                                       __this.__point.findById(currentRoute.points[index], function(err, newNextPoint){
                                           // set new next point
                                           currentTrans.next = {
                                               lat: newNextPoint.lat,
                                               lng: newNextPoint.lng,
                                               title: newNextPoint.title,
                                               _id: newNextPoint._id
                                           };
                                           // save this trans to db and response it
                                           currentTrans.save(function(err) {
                                               // return result
                                               if (!err) callback({trans: currentTrans});
                                               else callback({error: true});
                                           });
                                       })
                                   }
                                   // if there are not such point
                                   else callback({error: true});
                               });
                           }
                           // we are between CURRENT and NEXT
                           else {
                               currentTrans.distance = left;
                               currentTrans.save(function(err){
                                   // add error checking
                                   callback({trans: currentTrans});
                               });
                           }
                       }
                       // we are stayed at current station
                       else callback({trans: currentTrans});
                   }
                   // position is not selected before
                   else {
                       __this.__point.find({routes: routeId}, function(err, points){
                           if (!err) {
                               // async check each point
                               async.detect(points, function(point, callback) {
                                   // calculate distance between each point and current position
                                   var length = dist(point.lat, point.lng, lat, lng);
                                   // if we get required point
                                   if (length < DELTA_DISTANCE) callback(true);
                                   else callback(false);
                               }, function(currentPoint) {
                                   // there are required point
                                   if (currentPoint) {
                                       // get index of current point in point array, and increase it
                                       var index = currentRoute.points.indexOf(currentPoint._id) + 1;
                                       // if we get lat point - st index to 0, if other - don't change it
                                       // WILL BE DECREASED (done)
                                       index = (index === currentRoute.points.length - 1) ? 0 : index;
                                       // get index of this point in point array
                                       async.detect(points, function(p, callback) {
                                           if (p._id.toString() === currentRoute.points[index].toString()) callback(true);
                                           callback(false);
                                       }, function(nextPoint) {
                                           if (nextPoint) {
                                               currentTrans.current = {
                                                   lat: currentPoint.lat,
                                                   lng: currentPoint.lng,
                                                   title: currentPoint.title,
                                                   _id: currentPoint._id
                                               }
                                               currentTrans.next = {
                                                   lat: nextPoint.lat,
                                                   lng: nextPoint.lng,
                                                   title: nextPoint.title,
                                                   _id: nextPoint._id
                                               };
                                               currentTrans.distance = 0;
                                               // update each trans data in database
                                               currentTrans.save(function(err) {
                                                   if (!err) callback({trans: currentTrans});
                                               });
                                           }
                                       });
                                   }
                                   else callback({error: true});
                               })
                           }
                       });
                   }
               }
            });
        }
    })
};

// add route id to each point of array of points
Service.prototype.addRouteToPoints = function(points, route, callback) {
    var __this = this;
    async.each(points, function(id, callback) {
        __this.__point.findById(id, function(err, point){
            if ((!err) && (point)) {
                // disable duplicating indexes
                if (point.routes. indexOf(route) === -1) point.routes.push(route);
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