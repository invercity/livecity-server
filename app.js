/**
 * Created by Andrii Yermolenko on 2/6/14.
 */

const exec = require('child_process').exec;
const async = require('async');

// debug flag
const _DEBUG = false;
// get execution arguments
const arg = process.argv.slice(2)[0];

if (arg === 'test') {
    exec('node transport.js create', function() {
        console.log('test data created');
        async.forever(function(callback) {
            exec('nodejs transport.js do', function(err, sout) {
                if (_DEBUG) console.log(sout);
                setTimeout(callback, 2000);
            });
        }, function() {
            console.log('done...');
        });
    });
}
else if (arg === 'clean') {
    exec('node transport.js clean', function() {
        console.log('cleaned');
    });
}
else if (arg === 'run') {
    async.forever(function(callback) {
        exec('node server.js', function(err, sout) {
            console.log(sout);
            callback();
        });
    });
}


