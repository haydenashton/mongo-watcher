
OpLog = function(entry) {
  this.operation = _operations[entry.op];
  this.db = this._db(entry.ns);
  this.collection = this._collection(entry.ns);
  this._id = this._documentId(entry);
};


OpLog.prototype._db = function(namespace) {
  return namespace.split('.')[0];
};

OpLog.prototype._collection = function(namespace) {
  var parts = namespace.split('.');
  return parts.length > 1 ? parts[1] : '';
};

OpLog.prototype._documentId = function(entry) {
  switch (this.operation) {
    case 'insert':
    case 'delete':
      return entry.o._id;
    case 'update':
      return entry.o2._id;
    default:
      return '';
  }
};


module.exports = OpLog;


var _operations = {
  'i': 'insert',
  'u': 'update',
  'd': 'delete',
  'n': 'no-op'
};
