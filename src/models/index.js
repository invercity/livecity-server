const mongoose = require('mongoose');
const config = require('config');
const logger = require('../util').getLogger('mongoose')

mongoose.connect(config.get('db.uri')).then(() => logger.info('Connected to db'));

const Guide = require('./Guide.model');
const Node = require('./Node.model');
const Point = require('./Point.model');
const Route = require('./Route.model');
const Transport = require('./Transport.model');
const User = require('./User.model');

module.exports = {
  Guide,
  Node,
  Point,
  Route,
  Transport,
  User
};
