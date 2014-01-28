/**
 * Created by invercity on 1/24/14.
 */
var DELTA_DISTANCE = 50;

var rad = function(x) {
    return x * Math.PI / 180;
};

var dist = function(a1, a2, b1, b2) {
    var R = 6371; // earth's mean radius in km
    var dLat = rad(b1 - a1);
    var dLong = rad(b2 - a2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(a1)) * Math.cos(rad(b1)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3);
};

function Service(point, node, route, trans) {
    this.__point = point;
    this.__route = route;
    this.__node = node;
    this.__trans = trans;
};

Service.prototype.getPointInfo = function() {

};

// update transport data in database
Service.prototype.updateTransportData = function(_id, route, lat, lng, callback) {
    var __this = this;
    // find each transport by _id
    this.__trans.findById(_id, function (err, trans) {
        if (!err) {
            // check if we find each transport
            if (trans) {
                // if position already searched
                if ((trans.current) && (trans.next)) {
                    // calculate distance between CURRENT point and current transport position
                    var length = dist(lat, lng, trans.current.lat, trans.current.lng);
                    // if we out of previous station
                    if (length > DELTA_DISTANCE) {
                        // calculate distance from current position to NEXT station
                        var left = dist(lat, lng, trans.next.lat, trans.next.lng);
                        // check if we at the NEXT station
                        if (left < DELTA_DISTANCE) {
                            // set NEXT point as CURRENT point
                            trans.current = trans.next;
                            // set distance
                            trans.distance = 0;
                            // get current route, and its points
                            __this.route.findById(route, function(err, route) {
                                if (!err) {
                                    // get the route NEXT station
                                    var index = route.points.indexOf(trans.next) + 1;
                                    index = (index === route.points.length) ? 0 : index;
                                    trans.next = route.points[index];
                                    trans.save(function(err) {
                                        // return result
                                        if (!err) callback({trans: trans});
                                        else callback({error: true});
                                    })
                                }
                            });
                        }
                        // we are between CURRENT and NEXT
                        else {
                            trans.distance = left;
                            callback({trans: trans});
                        }
                    }
                    // we are stayed at current station
                    else {
                        callback({trans: trans});
                    }
                }
                // position is not searched before
                else {
                    // TBD
                }
            }
        }
    })
};