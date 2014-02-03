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

var cars = [];

Route.find(function(err, route) {
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
        setTimeout(function() {
            Transport.findById(cars[0].car._id, function(err, res) {
                console.log(res);
            })
            async.forever(function(callback){
                for (var b=0; b<20;b++) {
                    var index = points.indexOf(cars[b].point) + 1;
                    if (index === (points.length)) index = 0;
                    cars[b].point = points[index];
                    service.updateTransportData(cars[b].car._id, route[0]._id, points[index].lat, points[index].lng, function(result){
                        console.log(JSON.stringify(result));
                        setTimeout(callback, 3000);
                    })
                }
            });
        }, 1000);
    })
})