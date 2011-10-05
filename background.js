chrome.extension.onRequest.addListener(
  function(message, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    
    switch(message.type){
    case "hello":
    	sendResponse("hello");	
    	break;
    case "push":
    	document.execCommand('Copy');
    	var result = push(message.content, sender);
    	sendResponse("pushed"+message.content+" "+result);
    	break;
    case "get_all":
    	var result = get_all();
    	sendResponse(result);
    	break;
    default:
    	sendResponse("hello");	
    }
    
  }
);
var killring = new Array();
var maxKill = 9;// num < 10
function push_obj(str, url){
    this.string = new String(str);
    this.url = new String(url);
}
function push(string, sender){
	//killring is full.throw oldest string 
    var obj =  new push_obj(string, sender.tab.url);
    killring.push(obj);
    chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
    var int=window.setInterval(function(){
	chrome.browserAction.setBadgeBackgroundColor({color:[0, 200, 0, 200]});	
	window.clearInterval(int);
    },1000);
    if(killring.length>maxKill){
	killring.shift();
	chrome.browserAction.setBadgeText({text:"max"});
    }else{
	chrome.browserAction.setBadgeText({text:""+killring.length});
    }
    return killring.length;
}
function get_all(){
	var all = new Array();
	//copy
	all = killring;
	console.log(all);
	return all;
}
