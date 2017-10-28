var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var col = db.collection('streams');
  // Insert a single document
  col.insert([{a:1}, {a:1}, {a:1}], function(err, r) {
    assert.equal(null, err);
    assert.equal(3, r.result.n);

    // Get the results using a find stream
    var cursor = col.find({}).stream({
      transform: function(doc) { 
        return JSON.stringify(doc);
      }
    });

    cursor.on('data', function(doc) {
      console.log(doc);
    });

    cursor.once('end', function() {
      db.close();
    });
  });
});