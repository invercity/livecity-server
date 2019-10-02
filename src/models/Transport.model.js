const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const TransportSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  current: {
    _id: {
      type: ObjectId,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  next: {
    _id: {
      type: ObjectId,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  route: {
    type: ObjectId,
    required: false
  },
  distance: {
    type: Number,
    required: false
  }
});

module.exports = mongoose.model('Transport', TransportSchema);
