/**
 * Created by invercity on 2/3/14.
 */
/*
 DEMO - moving transport on a map
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


var arg = process.argv.slice(2)[0];

if (arg) {
    if (arg == 'create') {
        Temp.find(function(err, points) {
            var indexes = [542, 191]//, 253]//, 253, 360, 429]//, 64, 13, 64, 114, 191, 213, 231, 240, 253, 378, 360, 401, 429, 452, 475];
            async.each(indexes, function(item, callback) {
                var car = new Transport({
                    lat: points[item - 1].lat.toFixed(6),
                    lng: points[item - 1].lng.toFixed(6)
                });
                car.save(function(err) {
                    //setTimeout(function() {
                        callback();
                    //}, 2000);
                });
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
                        async.detect(points, function(p, callback) {
                            if ((p.lat.toFixed(6) === item.lat.toFixed(6)) &&
                                (p.lng.toFixed(6) === item.lng.toFixed(6))) callback(true);
                            callback(false);
                        }, function(point) {
                            if (point) {
                                var index = points.indexOf(point) + 1;
                                if (index === points.length) index = 0;
                                var nextPoint = points[index];
                                service.updateTransportData(item._id, routes[0]._id,
                                    nextPoint.lat.toFixed(6), nextPoint.lng.toFixed(6), function() {
                                        callback();
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