const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const NodeSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  start: {
    type: ObjectId,
    required: true
  },
  end: {
    type: ObjectId,
    required: true
  },
  points: {
    type: String,
    required: false
  },
  total: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Node', NodeSchema);
