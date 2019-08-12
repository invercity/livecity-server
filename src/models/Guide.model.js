const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const GuideSchema = new mongoose.Schema({
  start: {
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  },
  group: {
    type: ObjectId,
    required: false
  },
  data: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Guide', GuideSchema);
