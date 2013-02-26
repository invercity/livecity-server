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

// http server for main page
http.createServer(function(request,response) {
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
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            console.log('Something goes wrong ;(');
            response.writeHead(404);
            response.end();
        }
    });
}).listen(8880);

// http server for transactions
http.createServer(function (request, response) {
    // check request type
   if (request.method == "POST") {
       console.log("new POST connection");
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
          console.log("type = " + values['type']);
          // if webpage requires load stations
          if (values['type'] == "GET_STATION") {
              connection.query("SELECT * FROM stations", function (error, rows, fields) {
                    response.writeHead(200, {
                          'Content-Type': 'x-application/json',
                          'Access-Control-Allow-Origin' : 'http://localhost:8880'
                    });
                    // sending JSON data
                    response.end(JSON.stringify(rows));
                    //console.log(JSON.stringify(rows));
              });
          }
          if (values['type'] == "SEND_STATION") {
              connection.query("INSERT INTO stations(pos_a,pos_b,name) VALUES('" + values['pos_a'] + "','" + 
                  values['pos_b'] + "','" + values['name'] + "');");
              connection.query("SELECT id FROM stations WHERE pos_a = '" + values['pos_a'] + 
                  "' AND pos_b = '" + values['pos_b'] + "';", function (error, rows, fields) {
                        response.writeHead(200, {
                        'Content-Type': 'x-application/json',
                        'Access-Control-Allow-Origin' : 'http://localhost:8383'
                        });
                        // sending JSON data
                        response.end(JSON.stringify(rows));
              });
          }
          // end type checking
       });
   }
   
}).listen(8888);
   