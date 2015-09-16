Listen for changes in Mongodb

Example: Listen to changes from all databases and collections.

```javascript

var listener = require('mongo-watcher');

var changeStream = listener();

changeStream.on('data', function(data) {
  console.log(data);
});

```


Listen to changes on all collections in a specific database:

```javascript

var listener = require('mongo-watcher');

var options = {
  database: 'logging'
};

var changeStream = listener(options);

changeStream.on('data', function(data) {
  console.log(data);
});


```
