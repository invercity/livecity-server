# livecity-server
[![Build Status](https://travis-ci.org/invercity/livecity-server.svg?branch=master)](https://travis-ci.org/invercity/livecity-server)  
Interactive system for monitoring city traffic  
Last version: ```0.3.3```  
## Features
### Current features list:
1. Displaying routes, points, transports;
2. Displaying transport arrival data;
3. Point editor (full functionality), route editor (create only), basic guide editor;
4. Basic authorization.

## Installation
### Pre-requirements
- [Node.JS](https://nodejs.org) 6 and above;
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





