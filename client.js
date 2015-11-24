var debug = require('debug')('pouch-websocket-sync:client');
var Websocket = require('websocket-stream');
var PouchSync = require('pouch-stream-multi-sync');

module.exports = createClient;

function createClient() {
  return PouchSync.createClient(function(address) {
    return Websocket(address);
  });
}
