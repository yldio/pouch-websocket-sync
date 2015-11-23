var debug = require('debug')('pipe-channels:test');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var before = lab.before;
var after = lab.after;
var it = lab.it;
var Code = require('code');
var expect = Code.expect;

var PouchDB = require('pouchdb');
var http = require('http');

var port = 4654;
var PouchWebsocketSync = require('../');

describe('pouch-websocket-sync', function() {
  var db = new PouchDB({
    name: 'todos',
    db: require('memdown'),
  });
  var serverDB = new PouchDB({
    name: 'todos-server',
    db: require('memdown'),
  });
  var httpServer;
  var server;
  var client;

  describe('server', function() {

    it('can be created', function(done) {
      httpServer = http.createServer();
      server = PouchWebsocketSync.createServer(httpServer);
      done();
    });

    it('can listen', function(done) {
      httpServer.listen(port, done);
    });

  });

  describe('client', function() {
    it('can be created', function(done) {
      client = PouchWebsocketSync.createClient('ws://localhost:' + port);
      done();
    });

    it('can be made to sync', function(done) {
      var sync = client.sync(db, { credentials: { token: 'some token'}});
      sync.once('error', function(err) {
        expect(err).to.be.an.object();
        expect(err.message).to.equal('no database event listener on server');
        sync.cancel();
        done();
      });
    });
  });

  describe('server', function() {
    it('can deny database requests', function(done) {
      server.once('database', function(credentials, database, callback) {
        expect(credentials).to.deep.equal({token: 'some token'});
        callback(new Error('go away'));
      });

      client = PouchWebsocketSync.createClient('ws://localhost:' + port);
      var sync = client.sync(db, { credentials: { token: 'some token'}});

      sync.once('error', function(err) {
        expect(err).to.be.an.object();
        expect(err.message).to.equal('go away');
        sync.cancel();
        done();
      });
    });

    it('can accept database requests', function(done) {
      server.once('database', function(credentials, database, callback) {
        expect(credentials).to.deep.equal({token: 'some other token'});
        callback(null, serverDB);
      });

      client = PouchWebsocketSync.createClient('ws://localhost:' + port);
      var sync = client.sync(db, {
        credentials: { token: 'some other token'},
        remoteName: 'todos-server',
      });

      db.put({_id: 'A', a:1, b: 2}, function(err, reply) {
        if (err) throw err;
        sync.once('change', function() {
          serverDB.get('A', function(err, doc) {
            expect(err).to.equal(null);
            expect(doc).to.deep.equal({
              _id: 'A',
              a: 1,
              b: 2,
              _rev: reply.rev,
            });
            done();
          });
        });
      });

    });
  });
});
