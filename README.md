# pouch-websocket-sync

[![By](https://img.shields.io/badge/made%20by-yld!-32bbee.svg?style=flat)](http://yld.io/contact?source=github-pouch-websocket-sync)
[![Build Status](https://secure.travis-ci.org/pgte/pouch-websocket-sync.svg?branch=master)](http://travis-ci.org/pgte/pouch-websocket-sync?branch=master)


Sync several PouchDBs through websockets.

Supports reconnection, negotiation and authentication.

## Demo

See [here an example todo application](https://github.com/pgte/pouch-websocket-sync-example#readme) using React and Redux.

[Video demo](https://www.youtube.com/watch?v=2UOfVFseksw)

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
httpServer.listen(3000);

function onRequest(credentials, dbName, cb) {
  if (credentials.token == 'some token') {
    cb(null, new PouchDB(dbName));
  } else {
    cb(new Error('not allowed'));
  }
};
```

## Client

```js
var websocket = require('websocket-stream');
var PouchSync = require('pouch-websocket-sync');

var db = new PouchDB('todos');
var client = PouchSync.createClient();
var sync = client.sync(db, {
  remoteName: 'todos-server', // name remote db is known for
  credentials: { token: 'some token'} // arbitrary
});

client.connect('ws://somehost:someport');
```

## API

### PouchWebsocketSync.createServer(httpServer, onRequest)

Creates and returns a websocket server.

Arguments:
* `httpServer`: an HTTP server to bind to
* `onRequest`: a function to be called when a client requests access to a database. This function must have the following signature:

```js
function onRequest(credentials, dbName, callback)
```

The arguments to expect on this function are:
* `credentials`: arbitrary, whatever the client sends as credentials. Defaults to `undefined`.
* `dbName`: the name of the database to sync into as being requested by the client.
* `callback`: the callback to call once the request is to be granted or denied. If there is a problem with the requests (invalid credentials or other error), you should pass an error as first arguments. If, otherwise, the request for a database is to proceed, you should pass `null` or `undefined` as the first argument and a PouchDB database as the second.

Example of an `onRequest` function:

```js
function onRequest(credentials, dbName, cb) {
  if (credentials.token == 'some token') {
    cb(null, new PouchDB(dbName));
  } else {
    cb(new Error('not allowed'));
  }
};
```

## PouchWebsocketSync.createClient()

Creates and returns a webocket sync client.

### client.connect(address)

Connect to a given websocket address.

* `address` a websocket address, like `wss://somehost:3000`

### client.sync(database, options)

Start syncing the given database. Arguments:

* `database`: an instance of a PouchDB database
* `options`: an object containing the follow keys and values:
  * remoteName: remote database name. Defaults to the `database` name.
  * PouchDB: PouchDB constructor. Defaults to `database.constructor`.

Returns a sync object.

### client events

```js
client.emit('connect') // when connects
client.emit('disconnect') // when gets disconnected
client.emit('reconnect') // when starts attempting to reconnect
```

## Sync

### sync.cancel()

Cancel this sync.

## client.end() or client.destroy()

## sync events

```js
sync.emit('change', change)
sync.emit('paused')
sync.emit('active')
sync.emit('denied')
sync.emit('complete')
sync.emit('error', err)
```

## License

ISC
