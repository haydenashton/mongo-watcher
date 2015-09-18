## Listen for changes in Mongodb

Either replication must be set up or mongo must be configured as master.

```mongod --master```

### Example: Listen to changes from all databases and collections.

```javascript

var listener = require('mongo-watcher');

var changeStream = listener.listen();

changeStream.on('data', function(data) {
  console.log(data);
});

```


### Listen to changes on all collections in a specific database:

```javascript

var listener = require('mongo-watcher');

var options = {
  database: 'logging'
};

var changeStream = listener.listen(options);

changeStream.on('data', function(data) {
  console.log(data);
});


```

### Stream values:

```

  {
    operation: 'insert',
    db: 'files',
    collection: 'files',
    _id: 55fbd8665e494b42032a76a6
  }

```
