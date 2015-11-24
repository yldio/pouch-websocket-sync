var debug = require('debug')('pouch-websocket-sync:server');
var websocket = require('websocket-stream');
var PouchSync = require('pouch-stream-multi-sync');

module.exports = createServer;

function createServer(server, onRequest) {
  if (! server) {
    throw new Error('need a base HTTP server as first argument');
  }
  var wsserver = websocket.createServer({server: server}, handle);
  return wsserver;

  function handle(stream) {
    var server = PouchSync.createServer(onRequest);
    server.on('error', warn);
    stream.pipe(server).pipe(stream);
  }
}

function warn(err) {
  console.error(err);
}