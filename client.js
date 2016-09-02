var Websocket = require('websocket-stream');
var PouchSync = require('pouch-stream-multi-sync/client');

module.exports = createClient;

function createClient() {
  var client = PouchSync(function connect(address) {
    var ws = Websocket(address);
    ws.on('error', onError);
    return ws;
  });
  return client;

  /* istanbul ignore next */
  function onError(err) {
    if (err.message !== 'write after end') {
      client.emit('error', err);
    }
  }
}
