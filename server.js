/**
 * Created by Andrii Yermolenko on 12/16/13.
 */
const path = require('path');
const express = require('express');
// const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const cors = require('cors');
const config = require('config');

// const config = require('./lib/config');
// const utils = require('./lib/utils').Utils;

const app = express();

// const Point = require('./lib/db').Point;
// const Node = require('./lib/db').Node;
// const Route = require('./lib/db').Route;
// const Transport = require('./lib/db').Transport;
// const Guide = require('./lib/db').Guide;
// service layer
// users support
// const User = require('./lib/db').User;
// Temporary markers handler
// const Temp = require('./lib/db').Temp;
// create service layer
// const service = new Service(Point, Node, Route, Transport);
const api = require('./src/controllers');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(cookieParser());
app.use(session({
  secret: '123454321',
  resave: true,
  saveUninitialized: true
}));
//app.use(favicon());
//app.use(express.compress());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride()); // support PUT, DELETE
//app.use(app.router);

// app.engine('html', require('ejs').renderFile);

const { googleApiKey } = config.get('api');

app.get('/', function (req, res) {
  return res.render('index', { googleApiKey });
});

app.get('/client', function(req, res) {
  res.render('bus', { googleApiKey });
});

app.get('/points', function(req, res) {
  res.render('creator', { googleApiKey });
});

app.use(api);
app.use('/', express.static('public'));

// Run app on selected port
app.listen(config.get('app.port'), () => {
  console.log('Livecity server listening on port ' + config.get('app.port'));
});
