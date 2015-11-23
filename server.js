var debug = require('debug')('pouch-websocket-sync:server');
var websocket = require('websocket-stream');
var PipeChannels = require('pipe-channels');
var PouchStreamServer = require('pouch-stream-server');

module.exports = createServer;

function createServer(server) {
  if (! server) {
    throw new Error('need a base HTTP server as first argument');
  }
  var wsserver = websocket.createServer({server: server}, handle);
  return wsserver;

  function handle(stream) {
    const channelServer = PipeChannels.createServer();
    const pouchServer = PouchStreamServer();

    channelServer.on('request', onRequest);

    function onRequest(req) {
      var database = req.payload.database;
      var credentials = req.payload.credentials;

      debug('going to emit database event, credentials = %j, database = %j', credentials, database);
      var hasListeners = wsserver.emit('database', credentials, database, callback);
      if (! hasListeners) {
        warn('no database event listener on server');
        req.deny('no database event listener on server');
      }

      function callback(err, db) {
        if (err) {
          req.deny(err.message || err);
        } else {
          pouchServer.dbs.add(database, db);
          var channel = req.grant();
          channel.on('error', propagateError);
          channel.pipe(pouchServer.stream()).pipe(channel);
        }
      }
    }

    stream.on('error', warn);
    stream.pipe(channelServer).pipe(stream);
  }

  function propagateError(err) {
    server.emit('error', err);
  }
}

function warn(err) {
  console.error(err);
}