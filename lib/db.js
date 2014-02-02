
/**
 * Created by invercity on 12/16/13.
 */

var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.once('open', function callback () {
    //
});

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var Temps = new Schema({
    lat: Number,
    lng: Number
});

var Points = new Schema({
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    title: {type: String, required: true},
    routes: [ObjectId]
});

var Nodes = new Schema({
    data: {type: String, required: true},
    start: {type: ObjectId, required: true},
    end: {type: ObjectId, required: true},
    total: {type: Number, required: true}
});

var Routes = new Schema({
    start: {type: ObjectId, required: true},
    end : {type: ObjectId, required: true},
    nodes: [{node:ObjectId, total: Number}],
    points: [ObjectId],
    total: {type: Number, required: true},
    title: {type: String, required: true}
});

var Transports = new Schema({
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    current: {
        _id: {type: ObjectId, required: false},
        title: {type: String, required: false},
        lat: {type: Number, required: false},
        lng: {type: Number, required: false}
    },
    next: {
        _id: {type: ObjectId, required: false},
        title: {type: String, required: false},
        lat: {type: Number, required: false},
        lng: {type: Number, required: false}
    },
    route: {type: ObjectId, required: false},
    distance: {type: Number, required: false}
});

var Route = mongoose.model('Route', Routes);
var Node = mongoose.model('Nodes', Nodes);
var Point = mongoose.model('Point',Points);
var Transport = mongoose.model('Transport', Transports);
var Temp = mongoose.model('Temp', Temps);

module.exports.Point = Point;
module.exports.Node = Node;
module.exports.Route = Route;
module.exports.Transport = Transport;
module.exports.Temp = Temp;

