// include modules
var http = require('http'),mysql = require("mysql");
var fs = require('fs');
var index = fs.readFileSync('./index.html');
path = require('path');
// mysql connection
var connection = mysql.createConnection({
   user: "root",
   password: "ermolenko",
   database: "livecity"
});

// universal http server
http.createServer(function (request, response) {
    // check request type
    console.log(request.connection.remoteAddress);
   if (request.method == "POST") {
       // data buffer
       var data = '';
       // getting data chunks
       request.on('data', function (chunk) {
          data += chunk;
       });
       // all data loaded
       request.on('end', function () {
          // parsing JSON
          var values = JSON.parse(data);
          // if webpage requires load stations
          if (values['type'] == "GET_STATION") {
              // select values from db
              connection.query("SELECT * FROM stations", function (error, rows, fields) {
                    //write response head
                    response.writeHead(200, {'Content-Type': 'x-application/json'});
                    // sending JSON data
                    response.end(JSON.stringify(rows));
              });
          }
          if (values['type'] == "SEND_STATION") {
              var old_a;
              var old_b;
              // check if prev. station is NULL
              if (values['old_a'] == '') { 
                    old_a = values['pos_a'];
                    old_b = values['pos_b'];
              }
              else {
                  old_a = values['old_a'];
                  old_b = values['old_b'];
              }
              // check FLOAT type
              while (old_a[old_a.length-1] == '0') old_a = old_a.substring(0,old_a.length-1);
              while (old_b[old_b.length-1] == '0') old_b = old_b.substring(0,old_b.length-1);
              var query = "SELECT id FROM stations WHERE cast(pos_a as char) = " + old_a + 
                   " AND cast (pos_b as char) = " + old_b + ";";
              connection.query(query, function (error, rows, fields) {
                   //insert new
                   if ((error) || (rows.length == 0)) {
                         var row = rows[0];
                         connection.query("INSERT INTO stations(pos_a,pos_b,name) VALUES('" + 
                         values['pos_a'] + "','" + values['pos_b'] + "','" + values['name'] + "');");
                   }
                   // update such station
                   else {
                        var row = rows[0];
                        connection.query("UPDATE stations SET pos_a='" + values['pos_a'] + "',pos_b='" + 
                            values['pos_b'] + "',name='" + values['name'] + "' WHERE id='" + 
                            row['id'] + "';");
                   }
              });
              
              connection.query("SELECT id FROM stations WHERE pos_a = '" + values['pos_a'] + 
                        "' AND pos_b = '" + values['pos_b'] + "';", function (error, rows, fields) {
                            response.writeHead(200, {'Content-Type': 'x-application/json'});
                            // sending JSON data
                            response.end(JSON.stringify(rows));
              });
          }
          // end type checking
          if (values['type'] == "DELETE_STATION") {
              // check FLOAT type
              var old_a = values['pos_a'];
              var old_b = values['pos_b'];
              while (old_a[old_a.length-1] == '0') old_a = old_a.substring(0,old_a.length-1);
              while (old_b[old_b.length-1] == '0') old_b = old_b.substring(0,old_b.length-1);
              connection.query("DELETE FROM stations WHERE cast(pos_a as char) = " + old_a + 
                   " AND cast (pos_b as char) = " + old_b + ";", function (error, rows, fields) {
                   if (!error) console.log("removed succ");
              });
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              // sending JSON data
              response.end(JSON.stringify("result : ok"));
          }
       });
   }
   // retrieve main page
   else {
       var filePath = path.join('.', request.url);
    //checking includes
    path.exists(filePath, function(exists) {
        if (exists) {
            var extname = path.extname(filePath);
            var contentType = 'text/html';
            switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            }
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
   }

}).listen(9090);