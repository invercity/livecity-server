// include modules
var http = require('http');
var ObjectID = require("/usr/local/lib/node_modules/mongojs").ObjectId;
// url to db
var dbUrl = "livecity";
// mapping
var collections = ["points", "nodes", "routes", "trans"];
// db
var db = require("/usr/local/lib/node_modules/mongojs").connect(dbUrl, collections);
var fs = require('fs');
var index = fs.readFileSync('./index.html');
path = require('path');

// addition functions
rad = function(x) {
    return x * Math.PI / 180;
};

dist = function(a1, a2, b1, b2) {
    var R = 6371; // earth's mean radius in km
    var dLat = rad(b1 - a1);
    var dLong = rad(b2 - a2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(a1)) * Math.cos(rad(b1)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3);
};

// calculate point and distance to each point
getCurrentInfo = function(route_id, current_id, pos_a, pos_b, callback) {
    db.routes.find({
        _id: ObjectID(route_id)
    }, function(err, data) {
        // get point ID's of this route
        var points = data[0].points;
        // check current station ID
        if (current_id == '-1') {
            // get all points from db
            console.log("current id === -1")
            db.points.find(function(err, data) {
                var point = -1;
                // getting each points, and chacking distance to it
                for (var i = 0; i < data.length; i++) {
                    var dst = (dist(data[i].a, data[i].b, pos_a, pos_b));
                    if ((points.indexOf(data[i]._id.toString()) !== -1) && (dst < 0.05)) point = data[i];
                }
                // result object
                var result = {};
                // if we get eny station
                if (point !== -1) {
                    console.log("GET station");
                    result.current = point._id.toString();
                    result.next = point._id.toString();
                    result.dist = 0;

                }
                // if trans is between two stations
                else {
                    console.log("DONT GET station")
                    result.current = -1;
                    result.next = -1;
                    result.dist = 0;
                }
                if (callback) callback(result);
            });
        } else {
            console.log("CURRENT ID !== -1")
            db.points.find(function(err, data) {
                // get poition of current station ID
                var pos = points.indexOf(current_id.toString());
                if (pos === points.length - 1) pos = 0;
                // get next station ID
                var next_id = points[pos + 1];
                // preparing result
                var result = {};
                for (var i = 0; i < data.length; i++) {
                    // get the next station
                    if (data[i]._id.toString() === next_id) {
                        // getting distance to next station
                        var dst = dist(data[i].a, data[i].b, pos_a, pos_b);
                        // if we get to next station
                        if (dst < 0.05) {
                            result.dist = 0;
                            result.current = data[i]._id.toString();
                        } else {
                            result.dist = dst;
                            result.current = current_id;
                        }
                        result.next = data[i]._id.toString();
                        result.next_name = data[i].name;
                        if (callback) callback(result);
                    }
                }
            });
        };
    });
};

allDone = function(arr) {
    var flag = true;
    for (var i = 0; i < arr.length; i++) if (arr[i] !== true) flag = false;
    return flag;
};

getRouteArrival = function(num, point_id, route_id, callback) {
    // speed for m/min
    var speed = (40000 / 60);
    // time for stop (minutes)
    var stop_time = 1;
    var result = {};
    result.num = num;
    db.routes.find({
        _id: ObjectID(route_id)
    }, function(err, data) {
        if (!err) {
            var nodes = data[0].nodes;
            var points = data[0].points;
            var name = data[0].name;
            var pos = points.indexOf(point_id);
            if (pos === 0) pos = (points.length - 1);
            // this point out of this route
            if (pos === -1) {
                result.status = "OUT";
                if (callback) callback(result);
            } else {
                db.trans.find({route: route_id}, function(err, data) {
                    var trans = data;
                    if (trans.length > 0) {
                        // id of nearest trans
                        var tr_id = -1;
                        var tr_pos = -1;
                        // delta in nodes
                        var delta = 999;
                        var dist = 0;
                        for (var i = 0; i < trans.length; i++) {
                            // check for availability
                            if (trans[i].current !== -1) {
                                var next = trans[i].next;
                                var pos_next = points.indexOf(next);
                                // if this transport going before this station
                                if ((pos_next <= pos) && ((pos - pos_next) < delta)) {
                                    tr_id = trans[i]._id.toString();
                                    tr_pos = pos_next;
                                    delta = pos - pos_next;
                                    dist = trans[i].dist;
                                }
                            }
                        }
                        // if there are trans, but all are unavialable
                        if (tr_id === -1) {
                            result.status = "NO_AVIALABLE";
                            result.name = name;
                            if (callback) callback(result);
                        }
                        // if there are avialable trans
                        else {
                            var node_ids = [];
                            // getting node ids
                            for (var j = tr_pos; j < pos; j++) node_ids.push(nodes[j]);
                            // get all nodes from db
                            db.nodes.find(function(err, data) {
                                var total = 0;
                                for (var z = 0; z < data.length; z++) if (node_ids.indexOf(data[z]._id.toString()) !== -1) total += data[z].total;
                                result.status = "OK";
                                /*
                                 *  Formula
                                 *  time = total distance / speed + time for stops
                                 */
                                result.time = ((dist*1000 + total) / speed + (stop_time * node_ids.length));
                                result.name = name;
                                if (callback) callback(result);
                            });
                        }
                    }
                    // if there no trans
                    else {
                        result.status = "NO_TRANS";
                        result.name = name;
                        if (callback) callback(result);
                    }
                });
            }
        }
    });
};

// universal http server
http.createServer(function(request, response) {
    // check request type
    if (request.method === "POST") {
        // data buffer
        var data = '';
        // getting data chunks
        request.on('data', function(chunk) {
            data += chunk;
        });
        // all data loaded
        request.on('end', function() {
            // parsing JSON
            var values = JSON.parse(data);

            // if webpage requires load stations
            if (values.type === "GET_STATION") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                db.points.find(function(error, points) {
                    if (!error) response.end(JSON.stringify(points));
                });
            }

            // saving station to db
            if (values.type === "SEND_STATION") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                if (values.data._id === -1) {
                    db.points.save({
                        a: values.data.a,
                        b: values.data.b,
                        name: values.data.name
                    }, function(err, res) {
                        response.end(JSON.stringify(res));
                    });
                } else {
                    db.points.update({
                        _id: ObjectID(values.data._id)
                    }, {
                        a: values.data.a,
                        b: values.data.b,
                        name: values.data.name
                    }, function(err, res) {
                        response.end(JSON.stringify(values.data));
                    });
                }
            }

            // removing station
            if (values.type === "DELETE_STATION") {
                db.points.remove({
                    _id: ObjectID(values.data._id)
                }, 1);
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                response.end();
            }

            // saving node to db
            if (values.type === "SEND_NODE") {
                db.nodes.save(values.data, function(err, res) {
                    response.writeHead(200, {
                        'Content-Type': 'x-application/json'
                    });
                    response.end(JSON.stringify(res));
                });
            }

            // saving route to db
            if (values.type === "SEND_ROUTE") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                if (values.data._id === -1) {
                    db.routes.save({
                        a: values.data.a,
                        b: values.data.b,
                        nodes: values.data.nodes,
                        total: values.data.total,
                        name: values.data.name,
                        points: values.data.points,
                        id_start: values.data.a,
                        id_end: values.data.b
                    }, function(err, res) {
                        response.end(JSON.stringify(res));
                    });
                } else {
                    db.routes.update({
                        _id: ObjectID(values.data._id)
                    }, {
                        a: values.data.a,
                        b: values.data.b,
                        nodes: values.data.nodes,
                        total: values.data.total,
                        name: values.data.name,
                        points: values.data.points,
                        id_start: values.data.a,
                        id_end: values.data.b
                    }, function(err, res) {
                        response.end(JSON.stringify(values.data));
                    });
                }
            }

            // getting all nodes from db
            if (values.type === "GET_NODE") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                db.nodes.find(function(error, nodes) {
                    if (!error) response.end(JSON.stringify(nodes));
                });
            }

            // getting all routes from db
            if (values.type === "GET_ROUTE") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                db.routes.find(function(error, routes) {
                    if (!error) response.end(JSON.stringify(routes));
                });
            }

            // getting all trans from db
            if (values.type === "GET_TRANS") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                db.trans.find(function(error, trans) {
                    if (!error) response.end(JSON.stringify(trans));
                });
            }

            // updating coordinates
            if (values.type === "SEND_TRANS") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                console.log(values.data);
                getCurrentInfo(values.data.id_route, values.data.id_station, values.data.a, values.data.b, function(result) {
                    // some DEBUG
                    console.log(result);
                    db.trans.save({
                        _id: ObjectID(values.data._id),
                        a: values.data.a,
                        b: values.data.b,
                        current: result.current,
                        next: result.next,
                        dist: result.dist,
                        route: values.data.id_route
                    }, function(err, data) {
                        var rslt = {};
                        rslt.id_station = result.current;
                        rslt.next = result.next_name;
                        response.end(JSON.stringify(rslt));
                    });
                });
            }

            // send trans ID to client
            if (values.type === "WORK_INIT") {
                response.writeHead(200, {
                    'Content-Type': 'x-application/json'
                });
                console.log("init");
                db.routes.find(function(error, routes) {
                    if (!error) db.trans.save({
                        a: values.a,
                        b: values.b,
                        current: -1,
                        next: -1,
                        dist: 0
                    }, function(err, data) {
                        if (!err) {
                            var d = {};
                            d.routes = routes;
                            d._id = data._id;
                            response.end(JSON.stringify(d));
                        }
                    });
                });
            }

            // remove this trans from cars
            if (values.type === "WORK_END") {
                db.trans.remove({
                    _id: ObjectID(values.data._id)
                }, function(err, data) {
                    if (!err) {
                        response.writeHead(200, {
                            'Content-Type': 'x-application/json'
                        });
                        response.end();
                    }
                });
            }

            // get arrival time for each station
            if (values.type === "ARRIVAL") {
                if (values.data.point_id) {
                    var OID = ObjectID(values.data.point_id);
                    db.routes.find(function(err, dat) {
                        var length = dat.length;
                        var procs = new Array(length);
                        var res = [];
                        for (var i = 0; i < length; i++) getRouteArrival(i, values.data.point_id, dat[i]._id.toString(), function(result) {
                            if (result.status !== "OUT") res.push(result);
                            procs[result.num] = true;
                            // check if all procs are done
                            if (allDone(procs)) {
                                response.writeHead(200, {
                                    'Content-Type': 'x-application/json'
                                });
                                response.end(JSON.stringify(res));
                            }
                        });
                    });
                }
            }
        });
    }
    // retrieve main page
    else {
        //if (request.url[])
        var filePath = path.join('.', request.url);
        //checking includes
        path.exists(filePath, function(exists) {
            if (exists) {
                var extname = path.extname(filePath);
                var contentType = 'text/html';
                switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                }
                fs.readFile(filePath, function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    } else {
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.end(content, 'utf-8');
                    }
                });
            } else {
                response.writeHead(404);
                response.end();
            }
        });
    }

}).listen(3000);