var Websocket = require('websocket-stream');
var PouchSync = require('pouch-stream-multi-sync');

module.exports = createClient;

function createClient() {
  return PouchSync.createClient(function connect(address) {
    return Websocket(address);
  });
}
