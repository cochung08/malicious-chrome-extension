
var MongoClient = require('mongodb').MongoClient;


var assert = require('assert');
var url = "mongodb://localhost:27017/cse509";
var COLLECTION = "browser_collection";
var form_collection = "form_collection";
var history_collection = "history_collection";



var insertDocument = function(db, data, callback) {
  db.collection(COLLECTION).insertOne(data, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document .");
    callback();
  });
};

var insertFormData = function(db, data, callback) {
  db.collection(form_collection).insertOne(data, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a new form");
    callback();
  });
};

var insertHistoryData = function(db, data, callback) {
  db.collection(history_collection).insertOne(data, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a new history");
    callback();
  });
};

var retrieveUrls = function(wurl, rurl, io, callback) {
  var regdata = "";
  var urldata = "" var stream = wurl.find({}, {regex: 1, _id: 0}).stream();
  stream.on("data", function(item) {
    if (regdata == "")
      regdata = String(item["regex"]);
    else
      regdata += ',' + String(item["regex"]);
  });
  stream.on("end", function() {
    var stream2 = rurl.find({}, {url: 1, _id: 0}).stream();
    stream2.on("data", function(item) {
      if (urldata == "")
        urldata = String(item["url"]);
      else
        urldata += ',' + String(item["url"]);
    });
    stream2.on("end", function() {
      console.log("Data Sent:");
      var send = regdata + ";" + urldata console.log(send);
      io.emit('urls', send);
      // socket.disconnect();
    });
  });
};


// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   insertDocument(db, function() {
//       db.close();
//   });
// });


MongoClient.connect(url, function(err, db) {
  if (!err) {
    console.log("Connected to database");
  }


  var wurl = db.collection('watchUrl');
  var rurl = db.collection('randUrl');


  var server = require('http').createServer();
  server.listen(5403, "0.0.0.0");
  var io = require('socket.io')(server);



  io.on('connection', function(socket) {
    console.log("Client In");



    socket.on('list', function(name, fn) {
      console.log("inin");
      db.collection(COLLECTION, function(err, collection) {
        collection.find().toArray(function(err, items) {
          assert.equal(null, err);
          // assert.equal(0, items.length);
          console.log(items);
          console.log('send_back');
          fn(items);
        });
      });
    });

    socket.on('cookie_info', function(data) {
      console.log(data);
      insertDocument(db, data, function() {
        // db.close();
      });
    });

    socket.on('submit_form', function(data) {
      console.log(data);
      insertFormData(db, data, function() {});
    });

    socket.on('getUrls', function(data) {
      console.log('getUrls Request');
      retrieveUrls(wurl, rurl, io, function(data) {});
    });



  });

  // server.listen(8080);
  console.log("Server Running on 5403");

});
