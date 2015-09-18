var MongoClient = require('mongodb').MongoClient;
var OpLog = require('./lib/oplog.js');
var OutStream = require('./lib/oplog-stream.js');

exports.listen = function(options) {
  options = getOptions(options);

  var url = 'mongodb://' + options.host + '/local';
  var out = getOutStream();

  MongoClient.connect(url, function(err, db) {
    var dbCollection = db.collection(options.oplogName);
    var q = {'ns': new RegExp(options.database +
                   '\.' + options.collection)
            };

    db.on('close', function() {
      out.end();
    });

    runQuery(db, dbCollection, q, out);
  });

  return out;
};


function runQuery(db, dbCollection, q, out) {
  var args = {
    tailable: true,
    awaitData: true,
    noCursorTimeout: true
  };

  var stream = dbCollection.find(q, args).stream();

  stream.on('data', function(update) {
    out.write(update);
  });

  stream.on('close', function() {
    runQuery(db, dbCollection, q, out);
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
