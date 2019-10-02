const crypto = require('crypto');
const config = require('config');
const log4js = require('log4js');

module.exports = {
  generateHash: (value, salt) => {
    const hash = crypto.createHmac('sha512', salt);
    return hash.update(value).digest('hex');
  },
  generateSalt: () => crypto.randomBytes(config.get('app.saltWorkFactor')).toString('hex'),
  rad: (x) => (x * Math.PI) / 180,
  dist: (p1Lat, p1Lng, p2Lat, p2Lng) => {
    const R = 6371; // earth's mean radius in km
    const dLat = this.rad(p2Lat - p1Lat);
    const dLong = this.rad(p2Lng - p1Lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(this.rad(p1Lat)) * Math.cos(this.rad(p2Lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(3) * 1000;
  },
  getLogger: (moduleName) => {
    const logger = log4js.getLogger(moduleName);
    log4js.configure(config.get('log4js.config'));
    // pattern: '-yyyy-MM-dd'
    logger.level = config.get('log4js.logLevel');
    return logger;
  }
};
