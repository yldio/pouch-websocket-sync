var debug = require('debug')('pouch-websocket-sync:test');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var before = lab.before;
var after = lab.after;
var it = lab.it;
var Code = require('code');
var expect = Code.expect;

var PouchWebsocketSync = require('../');

describe('pouch-websocket-sync', function() {
  describe('server', function() {
    it('fails if no http server is given', function(done) {
      expect(function() {
        PouchWebsocketSync.createServer();
      }).to.throw('need a base HTTP server as first argument');
      done();
    });
  });
});