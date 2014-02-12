/**
 * Created by invercity on 2/6/14.
 */

var exec = require('child_process').exec;
var async = require('async');

// debug flag
var _DEBUG = false;

exec('nodejs demo.js create', function() {
    console.log('test data created');
    async.forever(function(callback) {
        exec('nodejs demo.js do', function(err, sout, serr) {
            if (_DEBUG) console.log(sout);
            setTimeout(callback, 2000);
        });
    }, function() {
        console.log('done...');
    });
});
