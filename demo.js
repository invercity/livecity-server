/**
 * Created by invercity on 2/3/14.
 */
/*
 DEMO - moving static transport on a map
 */
var async = require('async');
var ObjectId = require('mongoose').Schema.Types.ObjectId;
var Point = require('./lib/db').Point;
var Node = require('./lib/db').Node;
var Route = require('./lib/db').Route;
var Transport = require('./lib/db').Transport;
var Service = require('./lib/service').Service;
// Temporary markers handler
var Temp = require('./lib/db').Temp;
// create service layer
var service = new Service(Point, Node, Route, Transport);
// get run arguments
var arg = process.argv.slice(2)[0];

if (arg) {
    if (arg == 'create') {
        Temp.find(function(err, points) {
            // transport basic indexes
            var indexes = [103, 191, 253, 360];
            //, 253]//, 253, 360, 429]//, 64, 13, 64, 114, 191, 213, 231, 240, 253, 378, 360, 401, 429, 452, 475];
            async.each(points, function(item, callback) {
                if (indexes.indexOf(item.index) !== -1) {
                    var car = new Transport({
                        lat: item.lat,
                        lng: item.lng
                    });
                    car.save(function(err) {
                        callback();
                    });
                }
                else callback();

            }, function(err) {
                setTimeout(function() {
                    process.exit();
                }, 1000);
            })
        });
    }
    else if (arg == 'do') {
        Route.find(function(err, routes) {
            Temp.find(function(err, points) {
                Transport.find(function(err, trans){
                    async.each(trans, function(item, callback){
                        // detect current point
                        async.detect(points, function(p, callback) {
                            if ((p.lat === item.lat) &&
                                (p.lng === item.lng)) callback(true);
                            callback(false);
                        }, function(point) {
                            if (point) {
                                var index = point.index + 1;
                                //console.log('next index: ' + index);
                                if (index === points.length) index = 0;
                                // detect next point
                                async.detect(points, function(po, callback) {
                                    if (po.index === index) callback(true);
                                    callback(false);
                                }, function(nextPoint) {
                                    if (nextPoint) {
                                        var id = trans.indexOf(item);
                                        service.updateTransportData(item._id, routes[0]._id,
                                            nextPoint.lat, nextPoint.lng, function() {
                                                callback();
                                        });
                                    }
                                });

                            }
                            else callback();
                        })
                    }, function(err) {
                        process.exit();
                    });
                })
            });
        });
    }
    else if (arg == 'clean') {
        Transport.remove({}, function() {
            console.log('cleaned');
            process.exit();
        })
    }
    else process.exit();
}