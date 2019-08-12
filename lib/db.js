
/**
 * Created by Andrii Yermolenko on 12/16/13.
 */

/*
const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcrypt');
const async = require('async');
const utils = require('./utils').Utils;

// connect to mongoDb
mongoose.connect(config.get('db.uri'), { useNewUrlParser: true });
const db = mongoose.connection;

// open db
db.once('open', () => { });

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
// factor for creating salt
const __saltWorkFactor = (config.get('app:saltWorkFactor')) ? config.get('app:saltWorkFactor') : 10;

// Temporary points Scheme
const Temps = new Schema({
    lat: Number,
    lng: Number,
    index: Number,
    route: String
});

// Guide Scheme
const Guides = new Schema({
    start: {type: Number, required: true},
    end: {type: Number, required: true},
    group: {type: ObjectId, required: false},
    data: {type: String, required: true}
});

// Point Scheme
const Points = new Schema({
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    title: {type: String, required: true},
    routes: [ObjectId]
});

// static method for searching nearest points
Points.statics.findNear = function(position, distance, callback) {
    // find all points
    this.model('Point').find(function(err, points) {
        // array for point id's
        const ids = [];
        // filter points
        async.filter(points, function(item, callback) {
            // calculate distance
            const dist = utils.dist(position.lat, position.lng, item.lat, item.lng);
            // check distance
            const flag = (dist <= distance);
            // add id to ids array
            if (flag) ids.push(item._id);
            callback(flag);
        }, function(results) {
            // return points
            callback({
                points: results,
                ids: ids
            });
        });
    });
};

// Node Scheme
const Nodes = new Schema({
    data: {type: String, required: true},
    start: {type: ObjectId, required: true},
    end: {type: ObjectId, required: true},
    points: {type: String, required: false},
    total: {type: Number, required: true}
});

// Route Scheme
const Routes = new Schema({
    start: {type: ObjectId, required: true},
    end : {type: ObjectId, required: true},
    nodes: [{node:ObjectId, total: Number, start: String, end: String}],
    points: [ObjectId],
    total: {type: Number, required: true},
    title: {type: String, required: true}
});

// Post Save handler
Routes.post('save', function(route) {
    // check points of route
    async.each(route.points, function(id, callback) {
        // check if it is not first point
        if (route.points.lastIndexOf(id) !== route.points.length - 1) {
            Point.findById(id, function(err, point){
                if ((!err) && (point)) {
                    // disable duplicating indexes
                    if (point.routes.indexOf(route._id) == -1) point.routes.push(route._id);
                    point.save(function() {
                        callback();
                    })
                }
                else callback();
            });
        }
    }, function() {
    });
});

// Pre remove handler
Routes.pre('remove', function(next) {
    // get link to this
    const route = this;
    // check points of route
    async.eachSeries(route.points, function(id, callback) {
        // find each point
        Point.findById(id, function(err, point){
            if ((!err) && (point)) {
                // get point index in point array
                const index = point.routes.indexOf(route._id);
                // if this route exists
                if (index !== -1) {
                    // remove it from route array
                    point.routes.splice(index, 1);
                    // update this point
                    point.save(function() {
                        callback();
                    })
                }
                else callback();
            }
            else callback();
        });
    }, function() {
        // call next handler
        next();
    });
});

// Transport Scheme
const Transports = new Schema({
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

// User Scheme
const UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

// Crypt pass before saving
UserSchema.pre('save', function(next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(__saltWorkFactor, function(err, salt) {
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

// method for comparing passwords
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// create models
const Guide = mongoose.model('Guide', Guides);
const Route = mongoose.model('Route', Routes);
const Node = mongoose.model('Nodes', Nodes);
const Point = mongoose.model('Point',Points);
const Transport = mongoose.model('Transport', Transports);
const Temp = mongoose.model('Temp', Temps);
const User = mongoose.model('User', UserSchema);

// export models
module.exports.Guide = Guide;
module.exports.User = User;
module.exports.Point = Point;
module.exports.Node = Node;
module.exports.Route = Route;
module.exports.Transport = Transport;
module.exports.Temp = Temp;

 */
