/**
 * Created by invercity on 12/16/13.
 */
var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var stat = require('serve-static');
var config = require('./lib/config');
var pjson = require('./package.json');
var utils = require('./lib/utils').Utils;

var app = express();

// data types
var Point = require('./lib/db').Point;
var Node = require('./lib/db').Node;
var Route = require('./lib/db').Route;
var Transport = require('./lib/db').Transport;
var Guide = require('./lib/db').Guide;
// service layer
var Service = require('./lib/service').Service;
// users support
var User = require('./lib/db').User;
// Temporary markers handler
var Temp = require('./lib/db').Temp;
// create service layer
var service = new Service(Point, Node, Route, Transport);

var __DEBUG = config.get('debug');

app.use(utils.gc());
app.use(utils.cors());
app.use(cookieParser());
app.use(session({
    secret: '123454321',
    resave: true,
    saveUninitialized: true
}));
//app.use(favicon());
//app.use(express.compress());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride()); // support PUT, DELETE
//app.use(app.router);
app.use(stat(__dirname + '/views'));
app.set('/views',__dirname + '/views');
app.engine('html', require('ejs').renderFile);

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
        total: req.body.total,
        points: req.body.points
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
        node.points = req.body.points;
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
        service.removeRouteFromPoints(route._id, points);
        return route.save(function (err) {
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
});

app.delete('/data/routes/:id', function(req, res) {
    return Route.findById(req.params.id, function(err, route) {
        if (!route) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        return route.remove(function(err){
            if (!err) {
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
        index: req.body.id,
        route: req.body.route
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


/*
 * Guide CRUD
 */

app.get('/data/guide', function(req, res) {
    return Guide.find(function(err, guide) {
        if (!err) {
            return res.send(guide);
        }
        else {
            if (__DEBUG) console.log(err);
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

/*
 * SERVICES
 */

/*
 * Arrival service
 *
 * Type: GET
 *
 * Parameters:
 * /id: Arrival id
 *
 * Response:
 * Object
 *
 */
app.get('/service/arrival/:id', function(req,res) {
    service.getPointInfo(req.params.id, function(result) {
        return res.send(result);
    });
});

/*
 * Guide service
 *
 * Type: POST
 *
 * Request:
 * @start - Object {lat: Number, lng: Number}
 * @end - Object {lat: Number, lng: Number}
 *
 * Response:
 * @error - error message
 * @status - result [OK, ERROR]
 * @basic - google data
 * @data - own routes (not implemented now)
 *
 */
app.post('/service/guide', function(req, res) {
   service.getPersonalRoute(req.body.start, req.body.end, req.body.mode, function(results) {
       return res.send(results);
   });
});

/*
 * Service app
 *
 * Type: GET
 *
 * Request:
 * resource type/empty
 *
 * Response:
 * info
 */

app.get('/service/app', function(req, res) {
    return res.send({
        version: pjson.version
    });
});

app.get('/service/app/:type', function(req, res) {
    // switch type
    switch (req.params.type) {
        // version
        case 'version' :
            return res.send(pjson.version);
            break;
        // default act
        default:
            return res.send(null);
    }
});

/*
 * Mobile app work REST service
 *
 * Type: POST
 *
 * options:
 *  ?act=init
 *  ?act=end
 *  ?act=report
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
app.post('/service/transport', function (req, res) {
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

/*
 * Service login/logout
 *
 * Type: POST
 *
 * Options:
 * ?act=login
 * ?act=logout
 *
 * Request:
 * @login - user login
 * @pass - user pass
 *
 * Response:
 * session token will be selected if OK (login)
 * empty Object (logout)
 */
app.post('/service/login', function(req, res) {
    // ?act=login
    if ('login' === req.query.act) {
        User.findOne({username: req.body.login}, function(err, user) {
            if ((!err) && (user)) {
                user.comparePassword(req.body.pass, function (err, isMatch) {
                    if ((!err) && (isMatch)) {
                        req.session.authorized = true;
                        req.session.user = req.body.user;
                        res.send({authorized: true});
                    }
                    else res.send({error: 'Invalid user data'});
                });
            }
            else res.send({error: 'Invalid user data'});
        });
    }
    // ?act=logout
    else if ('logout' === req.query.act) {
        if (req.session) {
            req.session.destroy(function() {
                res.send({logout: true});
            })
        }
        else res.send({logout: true});
    }
});

/*
 * Service session
 *
 * Type: GET
 *
 * Request:
 * session token with authorized field
 *
 * Response:
 * @authorized - boolean
 * @user - current user
 *
 */
app.get('/service/login', function(req, res){
    if ((req.session) && (req.session.authorized)) {
        res.send({
            authorized: true,
            user: req.session.user
        });
    }
    else {
        res.send({});
    }
});

/*
 * Service register
 *
 * Type: POST
 *
 * Request:
 * @login - user login
 * @pass - user pass
 *
 * Response:
 * @user - created user
 *
 */
app.post('/service/register', function(req, res){
    var user = new User({
        username: req.body.username,
        password: req.body.password
    });
    user.save(function(err){
        if (!err) res.send({user: user});
        else res.send({err: err});
    });
});

// Run app on selected port
app.listen(config.get('port'), function(){
    console.log('Livecity server listening on port ' + config.get('port'));
});