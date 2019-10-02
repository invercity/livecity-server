const mongoose = require('mongoose');
const { dist } = require('../util');

const { ObjectId } = mongoose.Schema.Types;

const PointSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  routes: [ObjectId]
});

/**
 * Find nearest points to selected position
 * @param {Object} position
 * @param {Number} distance
 * @returns {Promise<{ids: [string], points: [Object]}>}
 */
PointSchema.statics.findNear = async (position, distance) => {
  // find all points
  const allPoints = await this.model('Point').find().exec();
  // array for point id's
  const ids = [];
  // filter points
  const points = allPoints.filter((item) => {
    // calculate distance
    const pointDistance = dist(position.lat, position.lng, item.lat, item.lng);
    // check distance
    const flag = (pointDistance <= distance);
    // add id to ids array
    if (flag) {
      ids.push(item._id);
    }
    return flag;
  });
  return {
    points,
    ids
  };
};


module.exports = mongoose.model('Point', PointSchema);
