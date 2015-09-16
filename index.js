var MongoClient = require('mongodb').MongoClient;
var OpLog = require('./lib/oplog.js');
var OutStream = require('./lib/oplog-stream.js');

exports.listen = function(options) {
  options = options || {};
  var url = options.url || 'mongodb://localhost/local';
  var oplogCollection = options.oplogName || 'oplog.$main';
  var args = {
    tailable: true,
    awaitData: true,
    noCursorTimeout: true
  };

  var database = options.database || '.*';
  var collection = options.collection || '.*';

  var out = new OutStream();

  MongoClient.connect(url, function(err, db) {
    console.log("Listening to changes...");

    var dbCollection = db.collection(oplogCollection);

    var q = {'ns': new RegExp(database + '\.' + collection)};
    var stream = dbCollection.find(q, args).stream();

    stream.on('data', function(update) {
      out.write(update);
    });

    stream.on('close', function() {
      out.end();
      db.close();
    });
  });

  return out;
};
