var websocket = require('websocket-stream');
var PouchSync = require('pouch-stream-multi-sync');

module.exports = createServer;

function createServer(httpServer, onRequest) {
  if (! httpServer) {
    throw new Error('need a base HTTP server as first argument');
  }
  var wsserver = websocket.createServer({server: httpServer}, handle);
  return wsserver;

  function handle(stream) {
    stream.on('error', propagateError);
    var server = PouchSync.createServer(onRequest);
    server.on('error', propagateError);
    stream.pipe(server).pipe(stream);
  }

  /* istanbul ignore next */
  function propagateError(err) {
    if (err.message !== 'write after end') {
      wsserver.emit('error', err);
    }
  }
}
