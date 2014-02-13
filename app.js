/**
 * Created by invercity on 2/6/14.
 */

var exec = require('child_process').exec;
var async = require('async');

// debug flag
var _DEBUG = false;
// get execution arguments
var arg = process.argv.slice(2)[0];

if (arg === 'test') {
    exec('nodejs transport.js create', function() {
        console.log('test data created');
        async.forever(function(callback) {
            exec('nodejs transport.js do', function(err, sout, serr) {
                if (_DEBUG) console.log(sout);
                setTimeout(callback, 2000);
            });
        }, function() {
            console.log('done...');
        });
    });
}
else if (arg === 'clean') {
    exec('nodejs transport.js clean', function() {
        console.log('cleaned');
    });
}
else if (arg === 'run') {
    async.forever(function(callback) {
        exec('nodejs --expose-gc server.js', function(err, sout, serr) {
            console.log(sout);
            callback();
        });
    });
}


