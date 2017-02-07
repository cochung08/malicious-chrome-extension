var x = document.getElementsByClassName("player-api player-width player-height");
x[0].style.backgroundColor = "gray";
x[0].style.textAlign = "center";
x[0].style.fontSize = "20px";

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

x[0].appendChild(p);



document.getElementById("player-api").style.display = "none";