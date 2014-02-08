/**
 * Created by invercity on 12/16/13.
 */
var express = require('express');
var app = express();
var config = require('./lib/config');
var pjson = require('./package.json');

var Point = require('./lib/db').Point;
var Node = require('./lib/db').Node;
var Route = require('./lib/db').Route;
var Transport = require('./lib/db').Transport;
var Service = require('./lib/service').Service;
// Temporary markers handler
var Temp = require('./lib/db').Temp;
// create service layer
var service = new Service(Point, Node, Route, Transport);

var __DEBUG = config.get('debug');

// adding CORS support...
var CORS = function(req, res, next) {
    // allowed domains (F - add options)
    res.header('Access-Control-Allow-Origin', '*');
    // allowed methods
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // allowed headers
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

// garbage collector
var GC = function(req, res, next) {
    gc();
    next();
};

app.configure(function() {
    app.use(CORS);
    app.use(GC);
    app.use(express.favicon());
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride()); // support PUT, DELETE
    app.use(app.router);
    app.use(express.static(__dirname + '/views'));
    app.set('/views',__dirname + '/views');
    app.engine('html', require('ejs').renderFile);
})

app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/client', function(req, res) {
    res.render('bus.html');
});

app.get('/points', function(req, res) {
    res.render('creator.html');
});

/*
 *  Points CRUD
 */

app.get('/data/points', function(req,res) {
    return Point.find(function(err, points) {
        if (!err) {
            return res.send(points);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

app.post('/data/points', function(req,res) {
    var point = new Point({
        lat: req.body.lat,
        lng: req.body.lng,
        title: req.body.title,
        points: []
    });
    point.save(function(err) {
        if (!err) {
            return res.send({point:point})
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.get('/data/points/:id', function(req,res) {
    return Point.findById(req.params.id, function(err, point) {
        if (!point) {
            res.statusCode = 404;
            return res.send({error : 'Not found'});
        }
        if (!err) {
            return res.send({point: point});
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.put('/data/points/:id', function(req,res) {
    return Point.findById(req.params.id, function(err, point) {
        if (!point) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        point.title = req.body.title;
        point.lat = req.body.lat;
        point.lng = req.body.lng;
        return point.save(function (err) {
            if (!err) {
                return res.send({point: point});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

app.delete('/data/points/:id', function(req, res) {
    return Point.findById(req.params.id, function(err, point) {
        if (!point) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        return point.remove(function(err){
            if (!err) {
                return res.send({});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

/*
 *  Nodes CRUD
 */

app.get('/data/nodes', function(req,res) {
    return Node.find(function(err, nodes) {
        if (!err) {
            return res.send(nodes);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

app.post('/data/nodes', function(req,res) {
    var node = new Node({
        data: req.body.data,
        start: req.body.start,
        end: req.body.end,
        total: req.body.total
    });

    node.save(function(err) {
        if (!err) {
            return res.send({node: node})
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.get('/data/nodes/:id', function(req,res) {
    return Node.findById(req.params.id, function(err, node) {
        if (!node) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        if (!err) {
            return res.send({node: node});
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.put('/data/nodes/:id', function(req,res) {
    return Node.findById(req.params.id, function(err, node) {
        if (!node) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        node.data = req.body.data;
        node.start = req.body.start;
        node.end = req.body.end;
        node.total = req.body.total;
        return node.save(function (err) {
            if (!err) {
                return res.send({node: node});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

app.delete('/data/nodes/:id', function(req, res) {
    return Node.findById(req.params.id, function(err, node) {
        if (!node) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        return node.remove(function(err){
            if (!err) {
                return res.send({});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

/*
 *  Routes CRUD
 */

app.get('/data/routes', function(req,res) {
    return Route.find(function(err, routes) {
        if (!err) {
            return res.send(routes);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

app.post('/data/routes', function(req,res) {
    var route = new Route({
        start: req.body.start,
        end : req.body.end,
        nodes: req.body.nodes,
        points: req.body.points,
        total: req.body.total,
        title: req.body.title
    });
    route.save(function(err) {
        if (!err) {
            // update points of each route
            service.addRouteToPoints(route.points, route._id);
            return res.send({route: route});
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.get('/data/routes/:id', function(req,res) {
    return Route.findById(req.params.id, function(err, route) {
        if (!route) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        if (!err) {
            return res.send({route: route});
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.put('/data/routes/:id', function(req,res) {
    return Route.findById(req.params.id, function(err, route) {
        if (!route) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        // save prev points of this route
        var points = route.points;
        route.start = req.body.start;
        route.end = req.body.end;
        route.nodes = req.body.nodes;
        route.points = req.body.points;
        route.total = req.body.total;
        route.title = req.body.title;
        return route.save(function (err) {
            if (!err) {
                // remove route from OLD points, and add to NEW
                service.removeRouteFromPoints(route._id, points);
                service.addRouteToPoints(route._id, route.points);
                return res.send({route: route});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

app.delete('/data/routes/:id', function(req, res) {
    return Route.findById(req.params.id, function(err, route) {
        if (!route) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        return route.remove(function(err){
            if (!err) {
                service.removeRouteFromPoints(route.points, route._id);
                return res.send({status: 'OK'});
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                return res.send({error : 'Server error'});
            }
        })
    });
});

/*
 * Transport CRUD
 */

app.get('/data/transport', function(req,res) {
    return Transport.find(function(err, trans) {
        if (!err) {
            return res.send(trans);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

/*
 * Temp markers CRUD
 *
 */

app.get('/data/temp', function(req,res) {
    return Temp.find(function(err, points) {
        if (!err) {
            return res.send(points);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

app.post('/data/temp', function(req,res) {
    var point = new Temp({
        lat: req.body.lat,
        lng: req.body.lng,
        index: req.body.id
    });
    point.save(function(err) {
        if (!err) return res.send({temp: point});
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    })
});

app.put('/data/temp/:id', function(req,res) {
    Temp.findById(req.params.id, function(err, temp){
        if (temp) {
            temp.lat = req.body.lat;
            temp.lng = req.body.lng;
            temp.save(function(err) {
                if (!err) return res.send({temp: temp});
                else {
                    if (__DEBUG) console.log(err);
                    res.statusCode = 500;
                    return res.send({error : 'Server error'});
                }
            });
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error : 'Server error'});
        }
    });
});

app.delete('/data/temp', function(req, res) {
    Temp.find(function(err, points) {
        if ((!err) && (points)) {
            points.forEach(function(item) {
                item.remove(function(err) {
                    if ((err) && (__DEBUG)) console.log(err);
                })
            });
            res.send({status: 'OK'});
        }
    });
});

// SERVICES

app.get('/arrival/:id', function(req,res) {
    service.getPointInfo(req.params.id, function(result) {
        return res.send(result);
    });
});

app.get('/app/version', function(req, res) {
    return res.send(pjson.version);
});

/*
 * Mobile app work REST service
 *
 * options:
 *  ?act=init
 *
 * Request format:
 *  lat (Number) - latitude (taken from GPS receiver)
 *  lng (Number) - longitude (taken from GPS receiver)
 *  options (Object) - other options (not avialable now)
 * Response format:
 *  error (String) [optionally] - shows the error message
 *  trans {
 *      lat (Number),
 *      lng (Number),
 *      _id (ObjectId) - unique trans ID
 *  }
 *  routes [{
 *      _id (ObjectId), - unique route ID
 *      title - route title
 *  }]
 */
app.post('/work', function (req, res) {
    // check act type
    // if init act
    if ('init' === req.query.act) {
        // create new trans
        var trans = new Transport({
            lat: req.body.lat,
            lng: req.body.lng
        });
        // save it to db
        trans.save(function(err) {
            if (!err) {
                // get all routes
                Route.find(function (err, routes) {
                    // create result object
                    var result = {
                        trans: trans
                    };
                    // check error
                    if (!err) result.routes = routes;
                    // if error, result.routes will be empty array
                    else {
                        if (__DEBUG) console.log(err);
                        result.routes = [];
                    }
                    res.send(result);
                })
            }
            else {
                if (__DEBUG) console.log(err);
                res.statusCode = 500;
                res.send({error : 'Server error'});
            }
        });
    }
    // if end act
    else if ('end' === req.query.act) {
        if (req.body._id) {
            Transport.findById(req.body._id, function (err, trans) {
                if ((!err) && (trans)) {
                    trans.remove(function(err) {
                        if (!err) {
                            res.send({});
                        }
                        else {
                            if (__DEBUG) console.log(err);
                            res.statusCode = 500;
                            res.send({error : 'Server error'});
                        }
                    })
                }
                else {
                    if (__DEBUG) console.log(err);
                    res.statusCode = 500;
                    res.send({error : 'Server error'});
                }
            });
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            res.send({error : '_id not selected in header'});
        }
    }
    // if report act
    else if ('report' === req.query.act) {
        service.updateTransportData(req.body._id,req.body.route, req.body.lat, req.body.lng, function(result){
            res.send(result);
        });
    }
});


app.listen(config.get('port'), function(){
    console.log('Express server listening on port ' + config.get('port'));
});