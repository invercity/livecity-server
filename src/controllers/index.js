const express = require('express');
const {
  Point,
  Node,
  Route,
  User,
  Transport,
  Guide
} = require('../models');
const MapService = require('../lib/Map.service');
const { getLogger } = require('../util');
const { version } = require('../../package');

const router = express.Router;
const service = new MapService(Point, Node, Route, Transport);
const logger = getLogger('controllers/index');

router.get('/data/points', (req, res) => Point.find((err, points) => {
  if (!err) {
    return res.send(points);
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.post('/data/points', (req, res) => {
  const point = new Point({
    lat: req.body.lat,
    lng: req.body.lng,
    title: req.body.title,
    points: []
  });
  point.save((err) => {
    if (!err) {
      return res.send({ point });
    }

    logger.error(err);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
});

router.get('/data/points/:id', (req, res) => Point.findById(req.params.id, (err, point) => {
  if (!point) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  if (!err) {
    return res.send({ point });
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.put('/data/points/:id', (req, res) => Point.findById(req.params.id, (err, point) => {
  if (!point) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  point.title = req.body.title;
  point.lat = req.body.lat;
  point.lng = req.body.lng;
  return point.save((saveErr) => {
    if (!saveErr) {
      return res.send({ point });
    }

    logger.error(saveErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

router.delete('/data/points/:id', (req, res) => Point.findById(req.params.id, (err, point) => {
  if (!point) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  return point.remove((removeErr) => {
    if (!removeErr) {
      return res.send({});
    }

    logger.error(removeErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

/*
 *  Nodes CRUD
 */

router.get('/data/nodes', (req, res) => Node.find((err, nodes) => {
  if (!err) {
    return res.send(nodes);
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.post('/data/nodes', (req, res) => {
  const node = new Node({
    data: req.body.data,
    start: req.body.start,
    end: req.body.end,
    total: req.body.total,
    points: req.body.points
  });

  node.save((err) => {
    if (!err) {
      return res.send({ node });
    }

    logger.error(err);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
});

router.get('/data/nodes/:id', (req, res) => Node.findById(req.params.id, (err, node) => {
  if (!node) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  if (!err) {
    return res.send({ node });
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.put('/data/nodes/:id', (req, res) => Node.findById(req.params.id, (err, node) => {
  if (!node) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  node.data = req.body.data;
  node.start = req.body.start;
  node.end = req.body.end;
  node.total = req.body.total;
  node.points = req.body.points;
  return node.save((saveErr) => {
    if (!saveErr) {
      return res.send({ node });
    }

    logger.error(saveErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

router.delete('/data/nodes/:id', (req, res) => Node.findById(req.params.id, (err, node) => {
  if (!node) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  return node.remove((removeErr) => {
    if (!removeErr) {
      return res.send({});
    }

    logger.error(removeErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

/*
 *  Routes CRUD
 */

router.get('/data/routes', (req, res) => Route.find((err, routes) => {
  if (!err) {
    return res.send(routes);
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.post('/data/routes', (req, res) => {
  const route = new Route({
    start: req.body.start,
    end: req.body.end,
    nodes: req.body.nodes,
    points: req.body.points,
    total: req.body.total,
    title: req.body.title
  });
  route.save((err) => {
    if (!err) {
      return res.send({ route });
    }

    logger.error(err);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
});

router.get('/data/routes/:id', (req, res) => Route.findById(req.params.id, (err, route) => {
  if (!route) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  if (!err) {
    return res.send({ route });
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

router.put('/data/routes/:id', (req, res) => Route.findById(req.params.id, (err, route) => {
  if (!route) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  // save prev points of this route
  const { points } = route;
  route.start = req.body.start;
  route.end = req.body.end;
  route.nodes = req.body.nodes;
  route.points = req.body.points;
  route.total = req.body.total;
  route.title = req.body.title;
  service.removeRouteFromPoints(route._id, points);
  return route.save((saveErr) => {
    if (!saveErr) {
      return res.send({ route });
    }

    logger.error(saveErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

router.delete('/data/routes/:id', (req, res) => Route.findById(req.params.id, (err, route) => {
  if (!route) {
    res.statusCode = 404;
    return res.send({ error: 'Not found' });
  }
  return route.remove((removeErr) => {
    if (!removeErr) {
      return res.send({ status: 'OK' });
    }

    logger.error(removeErr);
    res.statusCode = 500;
    return res.send({ error: 'Server error' });
  });
}));

/*
 * Transport CRUD
 */

router.get('/data/transport', (req, res) => Transport.find((err, trans) => {
  if (!err) {
    return res.send(trans);
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

/*
 * Guide CRUD
 */

router.get('/data/guide', (req, res) => Guide.find((err, guide) => {
  if (!err) {
    return res.send(guide);
  }

  logger.error(err);
  res.statusCode = 500;
  return res.send({ error: 'Server error' });
}));

/*
 * SERVICES
 */

/*
 * Arrival service
 *
 * Type: GET
 *
 * Parameters:
 * /id: Arrival id
 *
 * Response:
 * Object
 *
 */
router.get('/service/arrival/:id', (req, res) => {
  const { id } = req.params;
  return service.getPointInfo(id, result => res.send(result));
});

/*
 * Guide service
 *
 * Type: POST
 *
 * Request:
 * @start - Object {lat: Number, lng: Number}
 * @end - Object {lat: Number, lng: Number}
 *
 * Response:
 * @error - error message
 * @status - result [OK, ERROR]
 * @basic - google data
 * @data - own routes (not implemented now)
 *
 */
router.post('/service/guide', (req, res) => {
  const { start, end, mode } = req.body;
  return service.getPersonalRoute(start, end, mode, results => res.send(results));
});

/*
 * Service app
 *
 * Type: GET
 *
 * Request:
 * resource type/empty
 *
 * Response:
 * info
 */

router.get('/service/app', (req, res) => res.send({
  version
}));

router.get('/service/app/:type', (req, res) => {
  if (req.params.type === 'version') {
    return res.send(version);
  }
  return res.send(null);
});

/*
 * Mobile app work REST service
 *
 * Type: POST
 *
 * options:
 *  ?act=init
 *  ?act=end
 *  ?act=report
 *
 * Request format:
 *  lat (Number) - latitude (taken from GPS receiver)
 *  lng (Number) - longitude (taken from GPS receiver)
 *  options (Object) - other options (not avialable now)
 * Response format:
 *  error (String) [optionally] - shows the error message
 *  trans {
 *      lat (Number),
 *      lng (Number),
 *      _id (ObjectId) - unique trans ID
 *  }
 *  routes [{
 *      _id (ObjectId), - unique route ID
 *      title - route title
 *  }]
 */
router.post('/service/transport', (req, res) => {
  // check act type
  // if init act
  if (req.query.act === 'init') {
    // create new trans
    const trans = new Transport({
      lat: req.body.lat,
      lng: req.body.lng
    });
    // save it to db
    trans.save((err) => {
      if (!err) {
        // get all routes
        Route.find((findErr, routes) => {
          // create result object
          const result = {
            trans
          };
          // check error
          if (!findErr) result.routes = routes;
          // if error, result.routes will be empty array
          else {
            logger.error(findErr);
            result.routes = [];
          }
          res.send(result);
        });
      } else {
        logger.error(err);
        res.statusCode = 500;
        res.send({ error: 'Server error' });
      }
    });
  } else if (req.query.act === 'end') {
    if (req.body._id) {
      Transport.findById(req.body._id, (findErr, trans) => {
        if ((!findErr) && (trans)) {
          trans.remove((err) => {
            if (!err) {
              res.send({});
            } else {
              logger.error(err);
              res.statusCode = 500;
              res.send({ error: 'Server error' });
            }
          });
        } else {
          logger.error(findErr);
          res.statusCode = 500;
          res.send({ error: 'Server error' });
        }
      });
    } else {
      res.statusCode = 500;
      res.send({ error: '_id not selected in header' });
    }
  } else if (req.query.act === 'report') {
    service.updateTransportData(req.body._id, req.body.route, req.body.lat, req.body.lng, (result) => {
      res.send(result);
    });
  }
});

/*
 * Service login/logout
 *
 * Type: POST
 *
 * Options:
 * ?act=login
 * ?act=logout
 *
 * Request:
 * @login - user login
 * @pass - user pass
 *
 * Response:
 * session token will be selected if OK (login)
 * empty Object (logout)
 */
router.post('/service/login', (req, res) => {
  // ?act=login
  if (req.query.act === 'login') {
    User.findOne({ username: req.body.login }, (err, user) => {
      if ((!err) && (user)) {
        user.comparePassword(req.body.pass, (err, isMatch) => {
          if ((!err) && (isMatch)) {
            req.session.authorized = true;
            req.session.user = req.body.user;
            res.send({ authorized: true });
          } else res.send({ error: 'Invalid user data' });
        });
      } else res.send({ error: 'Invalid user data' });
    });
  }  else if (req.query.act === 'logout') { // ?act=logout
    if (req.session) {
      req.session.destroy(() => {
        res.send({ logout: true });
      });
    } else res.send({ logout: true });
  }
});

/*
 * Service session
 *
 * Type: GET
 *
 * Request:
 * session token with authorized field
 *
 * Response:
 * @authorized - boolean
 * @user - current user
 *
 */
router.get('/service/login', (req, res) => {
  if ((req.session) && (req.session.authorized)) {
    res.send({
      authorized: true,
      user: req.session.user
    });
  } else {
    res.send({});
  }
});

/*
 * Service register
 *
 * Type: POST
 *
 * Request:
 * @login - user login
 * @pass - user pass
 *
 * Response:
 * @user - created user
 *
 */
router.post('/service/register', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.save((err) => {
    if (!err) res.send({ user });
    else res.send({ err });
  });
});

module.exports = router;
