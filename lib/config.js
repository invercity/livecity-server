
/**
 * Created by invercity on 12/22/13.
 */

var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './config.json' });

module.exports = nconf;