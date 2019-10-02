# livecity-server
[![GitHub Release](https://github-basic-badges.herokuapp.com/release/invercity/livecity-server.svg)]()
[![Build Status](https://travis-ci.org/invercity/livecity-server.svg?branch=master)](https://travis-ci.org/invercity/livecity-server)
[![David](https://david-dm.org/invercity/livecity-server.svg)](https://david-dm.org/invercity/livecity-server)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a97494f4f98946d2bdacdc1194335ad9)](https://www.codacy.com/manual/andriy.ermolenko/livecity-server?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=invercity/livecity-server&amp;utm_campaign=Badge_Grade)
[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)
Interactive system for monitoring city traffic  
## Features
### Current features list:
1. Displaying routes, points, transports;
2. Displaying transport arrival data;
3. Point editor (full functionality), route editor (create only), basic guide editor;
4. Basic authorization.

## Installation
### Pre-requirements
- [Node.JS](https://nodejs.org) 8 and above;
- [MongoDB](https://www.mongodb.com/what-is-mongodb) 3 and above;

### Next steps
Install dependencies:  
```npm i```
Configure application  
``` nano config/<$ENV>.json```

## Running
```npm start```

## API

```/data/[points, routes, nodes, transports]``` - Data CRUD
* GET - get all items
* POST - create item
* PUT ```/data/[type]/id``` - update item by ```id```
* GET ```/data/[type]/id``` - get item by ```id```
* DELETE ```/data/[type]/id``` - delete item by ```id```

```/service/[type]``` - Services
[TBD]

## Will be implemented:
- [!] ES6 migrate
- [!] Logger
- [!] Error handler
- Move to modern Vue2 interface
- Full guide functionality
- User roles
- Saving, sharing guides
- Transport info
- Locales
- Basic socket.io implementation
- API documentation
- Registration
- Route editor (full functionality)

## Wiki
[TBD]





