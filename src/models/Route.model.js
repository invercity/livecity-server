const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
const Point = mongoose.model('Point');

const RouteSchema = new mongoose.Schema({
  start: {
    type: ObjectId,
    required: true
  },
  end: {
    type: ObjectId,
    required: true
  },
  nodes: [
    {
      node: ObjectId,
      total: Number,
      start: String,
      end: String
    }
  ],
  points: [ObjectId],
  total: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

RouteSchema.post('save', async (route) => Promise.all(route.points.map(async (id) => {
  // check if it is not last point
  if (route.points.lastIndexOf(id) !== route.points.length - 1) {
    const point = await Point.findById(id).exec();
    if (!point) {
      return null;
    }
    if (point.routes.indexOf(route._id) === -1) {
      point.routes.push(route._id);
    }
    return point.save().exec();
  }
  return null;
})));
// check points of route
/* async.each(route.points, function(id, callback) {
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
}); */

RouteSchema.pre('remove', async () => {
  const route = this;
  return Promise.all(route.points.map(async (id) => {
    const point = await Point.findById(id).exec();
    if (!point) {
      return null;
    }
    const index = point.routes.indexOf(route._id);
    if (index !== -1) {
      // remove it from route array
      point.routes.splice(index, 1);
      // update this point
      return point.save().exec();
    }
    return null;
  }));
  // check points of route
  /* async.eachSeries(route.points, function(id, callback) {
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
  }); */
});

module.exports = mongoose.model('Route', RouteSchema);
