# livecity-server
![GitHub package.json version](https://img.shields.io/github/package-json/v/invercity/livecity-server)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a97494f4f98946d2bdacdc1194335ad9)](https://www.codacy.com/manual/andriy.ermolenko/livecity-server?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=invercity/livecity-server&amp;utm_campaign=Badge_Grade)
![License](https://img.shields.io/github/license/invercity/livecity-server)

Interactive system for monitoring city traffic  
## Features
### Current features list:
1. Displaying routes, points, transports;
2. Displaying transport arrival data;
3. Point editor (full functionality), route editor (create only), basic guide editor;
4. Basic authorization.

## Installation
### Pre-requirements
- [Node.JS](https://nodejs.org);
- [MongoDB](https://www.mongodb.com/what-is-mongodb)

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
- [!] Webpack
- Move to React interface
- Full guide functionality
- User roles
- Saving, sharing guides
- Transport info
- Locales
- Basic Socket.io implementation
- API documentation
- Registration
- Route editor (full functionality)

## Wiki
[TBD]





