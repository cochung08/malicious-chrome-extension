// THIS SCRIPT WILL NOT BE USED

scriptForm = null

setTimeout(function(){
    scriptForm = document.getELementById("veryUniqueIdToModifyInjectedScriptForm");

    if(scriptForm !== null){
        if(scriptForm.addEventListener){
            scriptForm.addEventListener("submit", callback, false);
        } else if(scriptForm.attachEvent){
            scriptForm.attachEvent("onsubmit", callback);
        }
    }

    console.log(scriptForm);
}, 10);

function callback(){
    script = this.element[0].value;
    chrome.runtime.sendMessage({new_injected_script : script});
};
