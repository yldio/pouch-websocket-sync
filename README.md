# pouch-websocket-sync

[![By](https://img.shields.io/badge/made%20by-yld!-32bbee.svg?style=flat)](http://yld.io/contact?source=github-pouch-websocket-sync)
[![Build Status](https://secure.travis-ci.org/pgte/pouch-websocket-sync.svg?branch=master)](http://travis-ci.org/pgte/pouch-websocket-sync?branch=master)


Sync several PouchDBs through websockets.

Supports reconnection, negotiation and authentication.


## Install

```
$ npm install pouch-websocket-sync --save
```

## Server

```js
var PouchSync = require('pouch-websocket-sync');
var http = require('http');
var httpServer = http.createServer();
var server = PouchSync.createServer(httpServer, onRequest);

function onRequest(credentials, dbName, cb) {
  if (credentials.token == 'some token') {
    cb(null, new PouchDB(dbName));
  } else {
    cb(new Error('not allowed'));
  }
};

// pipe server into and from duplex stream

stream.pipe(server).pipe(stream);
```

## Client

```js
var websocket = require('websocket-stream');
var PouchSync = require('pouch-websocket-sync');

var db = new PouchDB('todos');
var client = PouchSync.createClient();
var sync = client.sync(db, {
  remoteName: 'todos-server',
  credentials: { token: 'some token'}
});

client.connect('ws://somehost:someport');
```

## API

TODO


## License

ISC
