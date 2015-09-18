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

  var out = new OutStream();

  MongoClient.connect(url, function(err, db) {
    console.log("Listening to changes...");

    var collection = db.collection(oplogCollection);
    var stream = collection.find({}, args).stream();

    stream.on('data', function(document) {
      out.write(document);
    });

    stream.on('close', function() {
      console.log("Stream Closed");
      out.close();
      db.close();
    });
  });

  return out;
};

var changeStream = exports.listen();
changeStream.on('data', function(data){
  console.log(data);
});
