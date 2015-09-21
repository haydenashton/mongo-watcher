var stream = require('stream');
var util = require('util');
var OpLog = require('./oplog.js');


util.inherits(OplogStream, stream.Transform);

function OplogStream() {
  stream.Transform.call(this, {objectMode: true});
}

OplogStream.prototype._transform = function(chunk, encoding, done) {
  if(chunk.op !== 'n') {
    done(null, new OpLog(chunk));
  } else {
    done(null);
  }
};

module.exports = OplogStream;
