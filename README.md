# pouch-websocket-sync

Websocket live sync through websockets.

Supports:

* reconnection
* negotiation
* authentication

## Install

```
$ npm install pouch-websocket-sync --save
```

## Server

```js
var PouchWebsocketSync = require('pouch-websocket-sync');

var server = PouchWebsocketSync.createServer();

server.on('database', function(credentials, dbName, cb) {
  if (credentials.token == 'some token') {
    cb(null, new PouchDB(dbName));
  } else {
    cb(new Error('not allowed'));
  }
});

server.listen(port);
```

## Client

```js
var PouchWebsocketSync = require('pouch-websocket-sync');

var db = new PouchDB('todos');
var client = PouchWebsocketSync.createClient('wss://somehost:someport');
var sync = client.sync(db, {
  remoteName: 'todos-server',
  credentials: { token: 'some token'}
});
```

## License

ISC
