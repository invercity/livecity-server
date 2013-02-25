var mysql = require('mysql');

function stationsList() {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'ermolenko',
        database : 'livecity',
    });
 
    connection.connect();
 
    var queryString = 'SELECT * FROM stations';
 
    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;
 
        for (var i in rows) {
            console.log('Post Titles: ', rows[i].post_title);
        }
    });
 
    connection.end();
}


