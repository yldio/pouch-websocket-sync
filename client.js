var debug = require('debug')('pouch-websocket-sync:client');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var Reconnect = require('reconnect-core');
var Websocket = require('websocket-stream');
var PipeChannels = require('pipe-channels');
var PouchRemoteStream = require('pouch-remote-stream');

var reconnect = Reconnect(function(address) {
  return Websocket(address);
});

module.exports = createClient;

function createClient(address) {
  var PouchDB;
  var channels;
  var syncs = [];
  var r = reconnect(handleStream);
  r.on('error', propagateError);

  var client = new EventEmitter();
  client.sync = sync;
  client.destroy = client.end = destroy;

  r.connect(address);

  return client;

  // -----------------

  function handleStream(stream) {
    channels = PipeChannels.createClient();
    stream.on('error', propagateError);
    client.on('error', propagateError);
    stream.pipe(channels).pipe(stream);
    setupSyncs();
  }

  function sync(db, _options) {
    var options = extend({}, {
      remoteName: db._db_name,
    }, _options);

    debug('sync for db %s, options = %j', db._db_name, options);

    if (! options.remoteName) {
      throw new Error('need options.remoteName');
    }

    PouchDB = db.constructor || options.PouchDB;
    if (! PouchDB) {
      throw new Error('need options.PouchDB');
    }

    PouchDB.adapter('remote', PouchRemoteStream.adapter);

    var ret = new EventEmitter();
    ret.cancel = cancel;
    var sync = {
      db: db,
      options: options,
      ret: ret,
      canceled: false
    };

    syncs.push(sync);

    return ret;

    function cancel() {
      sync.canceled = true;
    }
  }

  function setupSyncs() {
    syncs.forEach(startSync);
  }

  function startSync(sync) {
    debug('startSync: %j', sync.options);
    var channel;
    var dbSync;

    if (!sync.canceled) {
      channels.channel({
        database: sync.options.remoteName,
        credentials: sync.options.credentials
      }, onChannel);

      sync.ret.cancel = cancel;
    }

    function onChannel(err, channel) {
      if (err) {
        sync.ret.emit('error', err);
      } else {
        var remote = PouchRemoteStream();
        var remoteDB = new PouchDB({
          name: sync.options.remoteName,
          adapter: 'remote',
          remote: remote,
        });
        debug('syncing %j to remote %j', sync.db._db_name, remoteDB._db_name);
        dbSync = PouchDB.sync(sync.db, remoteDB, {live: true});

        dbSync.on('change', function(change) {
          debug('change:', change.change.docs);
          sync.ret.emit('change', change);
        });

        channel.pipe(remote.stream).pipe(channel);
      }
    }

    function cancel() {
      if (channel) {
        channel.end();
      }
      if (dbSync) {
        dbSync.cancel();
      }
    }

  }

  function destroy() {
    r.reconnect = false;
    r.disconnect();
  }

  function propagateError(err) {
    client.emit('error', err);
  }

}