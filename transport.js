/**
 * Created by invercity on 2/3/14.
 */
/*
 * DEMO - moving static transport on a map
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
// get execution arguments
var arg = process.argv.slice(2)[0];

if (arg) {
    // if 'create' option selected
    if (arg == 'create') {
        Temp.find(function(err, points) {
            // transport basic indexes
            var indexes = [12, 64, 103, 161, 191, 211, 253, 297, 313, 360, 402, 428, 475];
            // prepare each transport
            async.each(points, function(item, callback) {
                // if this is an item from 'selected'
                if (indexes.indexOf(item.index) !== -1) {
                    // create such virtual transport
                    var car = new Transport({
                        lat: item.lat,
                        lng: item.lng
                    });
                    // and save it
                    car.save(function(err) {
                        callback();
                    });
                }
                else callback();

            }, function(err) {
                // finish process in 1 sec
                setTimeout(function() {
                    process.exit();
                }, 1000);
            })
        });
    }
    // if 'do' option selected
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
    // if 'clean' option selected
    else if (arg == 'clean') {
        Transport.remove({}, function() {
            process.exit();
        })
    }
    else process.exit();
}