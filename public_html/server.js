// include modules
var http = require('http');
var ObjectID = require("/usr/local/lib/node_modules/mongojs").ObjectId;
// url to db
var dbUrl = "livecity";
// mapping
var collections = ["points","nodes","routes"];
// db
var db = require("/usr/local/lib/node_modules/mongojs").connect(dbUrl,collections);
var fs = require('fs');
var index = fs.readFileSync('./index.html');
path = require('path');

// universal http server
http.createServer(function (request, response) {
    // check request type
    //console.log(request.connection.remoteAddress);
   if (request.method === "POST") {
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
          if (values.type === "GET_STATION") {
               response.writeHead(200, {'Content-Type': 'x-application/json'});
               db.points.find(function(error,points) {
                  if (!error) response.end(JSON.stringify(points));
               });
          }
          
          if (values.type === "SEND_STATION") {
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              if (values.data._id === -1) {
                  db.points.save({a:values.data.a,b:values.data.b,name:values.data.name},function(err,res) {
                      response.end(JSON.stringify(res));
                  });
              }
              else {
                  db.points.update({_id:ObjectID(values.data._id)},{a:values.data.a,b:values.data.b,name:values.data.name},function(err,res) {
                      response.end(JSON.stringify(values.data))
                  })
              }
          }
          
          if (values.type === "DELETE_STATION") {
              db.points.remove({_id:ObjectID(values.data._id)},1);
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              response.end();
          }
          
          if (values.type === "SEND_NODE") {
              db.nodes.save(values.data,function(err,res){
                  response.writeHead(200, {'Content-Type': 'x-application/json'});
                  response.end(JSON.stringify(res));
              });
          }
          
          if (values.type === "SEND_ROUTE") {
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              if (values.data._id === -1) {
                  db.routes.save({a:values.data.a,b:values.data.b,nodes:values.data.nodes,total:values.data.total},function(err,res) {
                      response.end(JSON.stringify(res));
                  });
              }
              else {
                  db.routes.update({_id:ObjectID(values.data._id)},{a:values.data.a,b:values.data.b,nodes:values.data.nodes,total:values.data.total},function(err,res) {
                      response.end(JSON.stringify(values.data));
                  });
              }
          }
          
          // return values
          if (values.type === "GET_NODE") {
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              db.nodes.find(function(error,nodes) {
                  if (!error) response.end(JSON.stringify(nodes));
              });
          }
          // return values
          if (values.type === "GET_ROUTE") {
              response.writeHead(200, {'Content-Type': 'x-application/json'});
              db.routes.find(function(error,routes) {
                  if (!error) response.end(JSON.stringify(routes));
              });
          }
       }); 
   }
   // retrieve main page
   else {
       //if (request.url[])
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

}).listen(8080);