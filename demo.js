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

var cars = [];

if (arg) {
    if (arg == 'create') {
        Temp.find(function(err, points) {
            var indexes = [points.length, 13, 64, 114, 191, 213, 231];
            async.each(indexes, function(item, callback) {
                var car = new Transport({
                    lat: points[item - 1].lat.toFixed(4),
                    lng: points[item - 1].lng.toFixed(4)
                });
                car.save(function(err) {
                    callback();
                });
            }, function(err) {
                console.log('done');
                process.exit();
            })
        });
    }
    if (arg == 'do') {
        Route.find(function(err, routes) {
            Temp.find(function(err, points) {
                Transport.find(function(err, trans){
                    async.each(trans, function(item, callback){
                        async.detect(points, function(p, callback) {
                            if ((p.lat.toFixed(4) === item.lat.toFixed(4)) &&
                                (p.lng.toFixed(4) === item.lng.toFixed(4))) callback(true);
                            callback(false);
                        }, function(point) {
                            if (point) {
                                var index = points.indexOf(point) + 1;
                                if (index === points.length) index = 0;
                                var nextPoint = points[index];
                                service.updateTransportData(item._id, routes[0]._id,
                                    nextPoint.lat.toFixed(4), nextPoint.lng.toFixed(4), function() {
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
    if (arg == 'clean') {
        Transport.remove({}, function() {
            console.log('cleaned');
            process.exit();
        })
    }
}

/*Route.find(function(err, route) {
    Temp.find(function(err, points) {
        for (var a=0; a< 20; a++) {
            var car = new Transport({
                lat: points[a*10].lat,
                lng: points[a*10].lng
            });
            car.save();
            cars.push({
                car: car,
                point: points[a*10]
            })
        }
        gc()
        setTimeout(function() {
            Transport.findById(cars[0].car._id, function(err, res) {
                console.log(res);
            })
            async.forever(function(callback){
                gc()
                for (var b=0; b<20;b++) {
                    var index = points.indexOf(cars[b].point) + 1;
                    if (index === (points.length)) index = 0;
                    cars[b].point = points[index];
                    service.updateTransportData(cars[b].car._id, route[0]._id, points[index].lat, points[index].lng, function(result){
                        delete result;
                        gc();
                        setTimeout(callback, 3000);
                    })
                }
            });
        }, 1000);
    })
}) */