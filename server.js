/**
 * Created by invercity on 12/16/13.
 */
var express = require('express');
var app = express();
var config = require('./lib/config');

var Point = require('./lib/db').Point;
var Node = require('./lib/db').Node;
var Route = require('./lib/db').Route;

var _DEBUG = config.get('debug');

app.configure(function() {
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

/*
 *  Points CRUD
 */

app.get('/data/points', function(req,res) {
    return Point.find(function(err, points) {
        if (!err) {
            return res.send(points);
        }
        else {
            res.statusCode = 500;
            return res.send({error: 'Server error'})
            if (_DEBUG) console.log(err);
        }
    });
});

app.post('/data/points', function(req,res) {
    var point = new Point({
        lat: req.body.lat,
        lng: req.body.lng,
        title: req.body.title
    });
    point.save(function(err) {
        if (!err) {
            return res.send({status: 'OK', point:point})
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
        }
    })
});

app.get('/data/points/:id', function(req,res) {
    return Point.findById(req.params.id, function(err, point) {
        if (!point) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        if (!err) {
            return res.send({ status: 'OK', point: point});
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
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
                return res.send({ status: 'OK', point: point});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
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
                return res.send({status : 'OK'});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
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
            res.statusCode = 500;
            return res.send({error: 'Server error'})
            if (_DEBUG) console.log(err);
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
            return res.send({ status: 'OK', node: node})
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
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
            return res.send({ status: 'OK', node: node});
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
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
                return res.send({ status: 'OK', node: node});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
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
                return res.send({status : 'OK'});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
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
            res.statusCode = 500;
            return res.send({error: 'Server error'})
            if (_DEBUG) console.log(err);
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
            return res.send({ status: 'OK', route: route})
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
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
            return res.send({ status: 'OK', route: route});
        }
        else {
            res.statusCode = 500;
            return res.send({error : 'Server error'});
            if (_DEBUG) console.log(err);
        }
    })
});

app.put('/data/routes/:id', function(req,res) {
    return Route.findById(req.params.id, function(err, route) {
        if (!route) {
            res.statusCode = 404;
            return res.send({ error : 'Not found'});
        }
        route.start = req.body.start;
        route.end = req.body.end;
        route.nodes = req.body.nodes;
        route.points = req.body.points;
        route.total = req.body.total;
        route.title = req.body.title;
        return route.save(function (err) {
            if (!err) {
                return res.send({ status: 'OK', route: route});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
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
                return res.send({status : 'OK'});
            }
            else {
                res.statusCode = 500;
                return res.send({error : 'Server error'});
                if (_DEBUG) console.log(err);
            }
        })
    });
});

app.get('/data/transport', function(req,res) {
    res.send([]);
});

// SERVICES

app.get('/arrival/:id', function(req,res) {
    var res1 = {
        status: 'OK',
        name: '16',
        time: 21
    };
    var res2 = {
        status: 'OK',
        name: '7',
        time: 8
    }
    var res0 = [];
    res0.push(res1);
    res0.push(res2);
    res.send(res0);
});


app.listen(config.get('port'), function(){
    console.log('Express server listening on port ' + config.get('port'));
});