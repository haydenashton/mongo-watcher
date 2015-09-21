var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var OutStream = require('./lib/oplog-stream.js');

exports.listen = function(options) {
  options = getOptions(options);

  var url = 'mongodb://' + options.host + '/local';
  var out = getOutStream();

  MongoClient.connect(url, function(err, db) {

    if(err) { throw new Error(err); }

    var dbCollection = db.collection(options.oplogName);

    db.on('close', function() {
      out.end();
    });

    runQuery(options, dbCollection, out);
  });

  return out;
};


function getLatestChange(collection, callback) {
  collection.find({}, {"ts": 1})
            .sort({$natural: -1})
            .limit(1)
            .toArray(function(err, docs) {
              if(err) return callback(err);

              if(docs.length && docs[0].ts) {
                callback(null, docs[0].ts);
              }
              else {
                callback(null,
                         MongoDB.Timestamp(0, Math.floor(new Date().getTime() / 1000)));
              }
  });
}


function runQuery(options, dbCollection, out) {
  var args = {
    tailable: true,
    awaitData: true,
    noCursorTimeout: true
  };

  getLatestChange(dbCollection, function(err, timestamp) {
    if(err) { throw new Error(err); }

    var q = {'ns': new RegExp(options.database +
                   '\.' + options.collection),
             'ts': {$gt: timestamp}
            };

    var stream = dbCollection.find(q, args).stream();

    stream.on('data', function(update) {
      out.write(update);
    });

    stream.on('close', function() {
      runQuery(options, dbCollection, out);
    });
  });
}


function getOutStream() {
  var out = new OutStream();

  out.on('close', function() {
    db.close();
  });

  return out;
}


function getOptions(options) {
  var defaults = {
    'host': 'localhost',
    'oplogName': 'oplog.$main',
    'database': '.*',
    'collection': '.*'
  };

  options = options || {};

  for(var key in defaults) {
    if(!(key in options)) {
      options[key] = defaults[key];
    }
  }

  return options;
}
