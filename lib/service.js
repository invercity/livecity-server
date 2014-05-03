/**
 * Created by invercity on 1/24/14.
 */

var async = require('async');
var config = require('./config');
var utils = require('./utils').Utils;
var gm = require('googlemaps');

//            //
//   VALUES   //
//            //

// minute per hour (constant)
var __minutePerHour = 60;
// delta for comparing
var __deltaDistance = /*config.get('app:deltaDistance');*/50;
// speed - 50 km/h, will be replaced later
var __defaultSpeed = /*config.get('app:defaultSpeed')/__minutePerHour;*/50;
// default period for bus stop (minutes)
var __defaultStopTime = config.get('app:defaultStopTime');
// default radius for searching guide points
var __defaultSearchPointRadius = /*config.get('app:defaultSearchPointRadius');*/500;

/*
 * Service class
 * traffic functions
 *
 * @point - link to db.points
 * @node - link to db.nodes
 * @route - link to db.route
 * @trans - link to db.trans
 */
function Service(point, node, route, trans) {
    this.__point = point;
    this.__route = route;
    this.__node = node;
    this.__trans = trans;
};

/*
 *[P] getPointInfo - get info for selected point
 * @_id - point ID
 * @callback - callback function
 */
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
                        // return NOTFOUND result
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
                            // link for nearest trans
                            var nearTransport = null;
                            // link to the near transport on a lap+
                            var nearTransportLap = null;
                            // check each trans, and find trans which is nearest to this station
                            async.eachSeries(allTransport, function(transport, callback) {
                                // find each transport index
                                var transportIndex = route.points.indexOf(transport.next._id);
                                // if nearTransportLap not set before, set it
                                if (!nearTransportLap) nearTransportLap = transport;
                                // if near not selected before, set current trans as near
                                if (!nearTransport) {
                                    // only if this transport BEFORE or ON current station
                                    if (transportIndex <= currentPointPosition) nearTransport = transport;
                                }

                                // if nearTransport selected already, compare it with each transport
                                else {
                                    // find index of currently nearest transport
                                    var currentNearIndex = route.points.indexOf(nearTransport.next._id);
                                    // check if currentTransport closer to currentStation
                                    if ((transportIndex <= currentPointPosition) && (transportIndex > currentNearIndex))
                                        // set each transport as nearTransport
                                        nearTransport = transport;
                                    // if transport AFTER the current station, and AFTER the nearTransportLap
                                    if ((transportIndex > currentPointPosition) && (transportIndex < nearTransportLap))
                                        // set transport as @nearTransportLap
                                        nearTransportLap = transport;
                                }
                                callback();
                            }, function() {
                                // when nearest trans find
                                if ((nearTransport) || (nearTransportLap)) {
                                    // link to near or nearLap transport
                                    var near = (nearTransport !== null) ? nearTransport : nearTransportLap;
                                    /* from point - if trans.distance equal 0,
                                     * this means that we at the CURRENT point
                                     * if this value differ from 0, this means that
                                     * we are between CURRENT and NEXT point, value is
                                     * distance to NEXT point
                                     */
                                    var from = (near.distance === 0) ? near.current._id : near.next._id;
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
                                    distance += near.distance;
                                    // time calculation (minutes)
                                    var time = distance/__defaultSpeed + nodes* __defaultStopTime;
                                    result.routes.push({
                                        status: 'OK',
                                        route: routeId,
                                        title: route.title,
                                        distance: distance,
                                        time: time.toFixed(0)
                                    });
                                }
                                // if nearest trans don't found, and there no trans on a lap+
                                else {
                                    // return NOTRANS result
                                    result.routes.push({
                                        status: 'NOTRANS',
                                        route: routeId,
                                        title: route.title
                                    });
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

/*
 * [P] getPersonalRoute - get route info for guide
 * @start - start point position (LatLng)
 * @end - end point position (LatLng)
 * @callback - callback function
 */
Service.prototype.getPersonalRoute = function(start, end, mode, callback) {
    // if start or end not set - callback error
    if ((!start) || (!end) || (!end.lat) || (!end.lng) || (!start.lat) || (!start.lng)) callback({
        errpr: 'Invalid request'
    });
    // array points for checking
    var points = [];
    // link to this
    var _this = this;
    // create gm points
    var gmStart = gm.checkAndConvertPoint([start.lat, start.lng]);
    var gmEnd = gm.checkAndConvertPoint([end.lat, end.lng]);
    // result object
    var result = {
        status: 'OK',
        result: null
    };
    // get google directions
    gm.directions(gmStart, gmEnd, function(err, data) {
        // if there not ways between these points - callback error
        // TO DO - find decision of this problem
        if (err) callback({
            status: 'ERROR'
        });
        // if there are way(s)
        else {
            // get important points from current route, which we find
            var steps = data.routes[0].legs[0].steps;
            // check each step
            for (var i=0;i<steps.length;i++) {
                // first (with index equal 0) - start location
                if (i === 0) points.push(steps[i].start_location);
                // all next - end location
                else points.push(steps[i].end_location);
            }
            // find points in nearest locations to START
            _this.__point.findNear(start, __defaultSearchPointRadius, function(startResult) {
                // find points in nearest locations to END
                _this.__point.findNear(end, __defaultSearchPointRadius, function(endResult){
                    // check count
                    if ((startResult.points.length === 0) || (endResult.points.length === 0)) callback({
                        status: 'ERROR'
                    });
                    // check points...
                    async.each(startResult.points, function(point, callback) {
                        // check routes of each point
                        if (point.routes.length > 0) {
                            // check each route and try to make road
                            async.each(point.routes, function(routeId, callback) {
                                // try to make line through this route
                                _this.__route.findById(routeId, function(err, currentRoute){
                                    // next
                                    if (!err) {
                                        // try to find ONE route between start and end
                                        async.filterSeries(endResult.ids, function(endPoint, callback){
                                            // callback - if this is a point of currentRoute
                                            callback(currentRoute.points.indexOf(endPoint) !== -1)
                                        }, function(xRoutes){
                                            // make result for each route
                                            if (xRoutes.length > 0) {
                                                for (var i=0;i<xRoutes.length;i++) {
                                                    // get start and end point ID
                                                    var startPointId = startResult.ids[startResult.points.indexOf(point)];
                                                    var endPointId = endResult.ids[i];
                                                    // get indexes
                                                    var indexA = currentRoute.points.indexOf(startPointId);
                                                    var indexB = currentRoute.points.indexOf(endPointId);
                                                    // check
                                                    if ((indexA !== -1) && (indexB !== -1)) {
                                                        // counter for distance
                                                        var distance = 0;
                                                        // if A point BEFORE B point
                                                        if (indexA < indexB) {
                                                            // calculate total distance
                                                            for (var indx=indexA;indx<indexB;indx++)
                                                                distance+= currentRoute.nodes[indx].total;
                                                        }
                                                        // if A point AFTER B point
                                                        else {
                                                            for (var i=indexB;i<currentRoute.nodes.length;i++)
                                                                distance+= currentRoute.nodes[i].total;
                                                            for (var i=0;i<indexB;i++)
                                                                distance+= currentRoute.nodes[i].total;
                                                        }
                                                        // calculate WALK TO
                                                        var distTo = utils.dist(start.lat, start.lng, point.lat, point.lng);
                                                        // find last station
                                                        var endStation = endResult.points[endResult.ids.indexOf(endPointId)]
                                                        // calculate WALK FROM
                                                        var distFrom = utils.dist(endStation.lat, endStation.lng, end.lat, end.lng);
                                                        // create current result
                                                        var r = {
                                                            type: 'ONE',
                                                            steps: [
                                                                {
                                                                    type: 'TO',
                                                                    route: currentRoute,
                                                                    start: null,
                                                                    end: startPointId,
                                                                    total: distTo
                                                                },
                                                                {
                                                                    type: 'BUS',
                                                                    route: currentRoute,
                                                                    start: startPointId,
                                                                    end: endPointId,
                                                                    total: distance
                                                                },
                                                                {
                                                                    type: 'FROM',
                                                                    route: currentRoute,
                                                                    start: endPointId,
                                                                    end: null,
                                                                    total: distFrom
                                                                }
                                                            ],
                                                            total: distance
                                                        };
                                                        // check if result exist
                                                        if (!result.result) result.result = r;
                                                        else {
                                                            if (result.result.type === 'ONE') {
                                                                var totalWalkCurr = result.result.steps[0].total +
                                                                    result.result.steps[2].total;
                                                                var totalWalkResultNew = distTo + distFrom;
                                                                // compare
                                                                var totalBusCurr = result.result.total;
                                                                // replace
                                                                if ((totalWalkCurr*5 + totalBusCurr) > (totalWalkResultNew*5 +
                                                                    distance)) result.result = r;
                                                                // end ----
                                                            }
                                                            // add checks for other types
                                                        }
                                                    }
                                                }
                                                callback();
                                            }
                                            /*
                                             * TO DO:
                                             * add creating route through more than one current routes
                                             *
                                             *
                                             */
                                            else callback();
                                        });
                                    }
                                    else callback();
                                });
                            }, function() {
                                callback();
                            });
                        }
                        else callback();
                    /*
                     * finished checking points...
                     */
                    }, function() {
                        //console.log(JSON.stringify(variants));
                        // all done
                        callback(result);
                    });
                });
            });
        }
    }, false, mode);
};

/*
 * [P] updateTransportData - update transport data in database
 * @_id - transport ID
 * @routeId - current route ID
 * @lat - transport latitude
 * @lng - transport longitude
 * @callback - callback function
 */
Service.prototype.updateTransportData = function(_id, routeId, lat, lng, callback) {
    var __this = this;
    // find each transport by _id
    this.__trans.findById(_id, function (err, currentTrans) {
        // check if we find each transport
        if ((!err) && (currentTrans)) {
            // find selected route
            __this.__route.findById(routeId, function(err, currentRoute) {
                //check error
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
                       var length = utils.dist(lat, lng, currentTrans.current.lat, currentTrans.current.lng);
                       // if we out of previous station
                       if (length > __deltaDistance) {
                           // calculate distance from current position to NEXT station
                           var left = utils.dist(lat, lng, currentTrans.next.lat, currentTrans.next.lng);
                           // check if we at the NEXT station
                           if (left < __deltaDistance) {
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
                                   else {
                                       currentTrans.save(function() {
                                           callback({error: true});
                                       });
                                   }
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
                       else {
                           currentTrans.save(function() {
                               callback({trans: currentTrans});
                           });
                       }
                   }
                   // position is not selected before
                   else {
                       __this.__point.find({routes: routeId}, function(err, points){
                           if (!err) {
                               // async check each point
                               async.detect(points, function(point, callback) {
                                   // calculate distance between each point and current position
                                   var length = utils.dist(point.lat, point.lng, lat, lng);
                                   // if we get required point
                                   if (length < __deltaDistance) callback(true);
                                   else callback(false);
                               }, function(currentPoint) {
                                   // there are required point
                                   if (currentPoint) {
                                       // get index of current point in point array, and increase it
                                       var index = currentRoute.points.indexOf(currentPoint._id) + 1;
                                       // if we get lat point - st index to 0, if other - don't change it
                                       // WILL BE DECREASED (done #0.1.2)
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
                                   else {
                                       currentTrans.save(function() {
                                           callback({error: true});
                                       });
                                   }
                               })
                           }
                       });
                   }
               }
            });
        }
    })
};

module.exports.Service = Service;