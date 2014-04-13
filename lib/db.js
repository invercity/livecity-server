
/**
 * Created by invercity on 12/16/13.
 */

var mongoose = require('mongoose');
var config = require('./config');
var bcrypt = require('bcrypt');
var async = require('async');
var utils = require('./utils').Utils;

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.once('open', function callback () {
    //
});

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
// temporary - will be replaced with nconf
var SALT_WORK_FACTOR = 10;

var Temps = new Schema({
    lat: Number,
    lng: Number,
    index: Number
});

var Guides = new Schema({
    start: {type: Number, required: true},
    end: {type: Number, required: true},
    group: {type: ObjectId, required: false},
    data: {type: String, required: true}
});

var Points = new Schema({
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    title: {type: String, required: true},
    routes: [ObjectId]
});

Points.statics.findNear = function(position, distance, callback) {
    this.model('Point').find(function(err, points) {
        async.filter(points, function(item, callback) {
            var dist = utils.dist(position.lat, position.lng, item.lat, item.lng);
            callback(dist <= distance);
        }, function(results) {
            callback(results);
        });
    });
};

var Nodes = new Schema({
    data: {type: String, required: true},
    start: {type: ObjectId, required: true},
    end: {type: ObjectId, required: true},
    points: {type: String, required: false},
    total: {type: Number, required: true}
});

var Routes = new Schema({
    start: {type: ObjectId, required: true},
    end : {type: ObjectId, required: true},
    nodes: [{node:ObjectId, total: Number, start: String, end: String}],
    points: [ObjectId],
    total: {type: Number, required: true},
    title: {type: String, required: true}
});

Routes.post('save', function(route) {
    async.each(route.points, function(id, callback) {
        Point.findById(id, function(err, point){
            if ((!err) && (point)) {
                // disable duplicating indexes
                if (point.routes.indexOf(route._id) === -1) point.routes.push(route._id);
                point.save(function() {
                    callback();
                })
            }
            else callback();
        });
    }, function() {
    });
});

Routes.post('remove', function(route) {
    async.each(route.points, function(id, callback) {
        Point.findById(id, function(err, point){
            if ((!err) && (point)) {
                var index = point.routes.indexOf(route._id);
                if (index !== -1) {
                    point.routes.splice(index, 1);
                    point.save(function() {
                        callback();
                    })
                }
                else callback();
            }
            else callback();
        });
    }, function() {
    });
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

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

UserSchema.pre('save', function(next) {
    var user = this;

// only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

// generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var Guide = mongoose.model('Guide', Guides);
var Route = mongoose.model('Route', Routes);
var Node = mongoose.model('Nodes', Nodes);
var Point = mongoose.model('Point',Points);
var Transport = mongoose.model('Transport', Transports);
var Temp = mongoose.model('Temp', Temps);
var User = mongoose.model('User', UserSchema);

module.exports.Guide = Guide;
module.exports.User = User;
module.exports.Point = Point;
module.exports.Node = Node;
module.exports.Route = Route;
module.exports.Transport = Transport;
module.exports.Temp = Temp;

