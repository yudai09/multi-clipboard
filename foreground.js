var keyEvent_beforeLoad={
};
var keyEvent_afterLoad ={
		v_alt:yank,
		c_ctr:kill,
};
var keyEvent=keyEvent_beforeLoad;

function Message(type,content){
	this.type=type;
	this.content=content;
}
//function sendMessage(message){
//	chrome.extension.sendRequest(message, function(response){
//		console.log("MESSAGE::"+response);
//		var res= response;
//		return res;
//	});
//}
if(window.addEventListener){
    window.addEventListener("load", onLoadListener,false);
//    window.addEventListener("unload", onUnLoadListener,false);
}

window.addEventListener("keydown", captureKeydown,false);//capture event
window.addEventListener("keypress", captureKeypress,false);//capture event
window.addEventListener("scroll",captureScroll,false);

// window.addEventListener("mouseup", function(e){
// 	console.log("mouseup");
// 	kill();
	
// });
var flushFuncBuffer=Array(32);

function onLoadListener(e){
	keyEvent=keyEvent_afterLoad;
}
function getScrollPosition() {
	var obj = new Object();
	obj.x = document.documentElement.scrollLeft || document.body.scrollLeft;
	obj.y = document.documentElement.scrollTop || document.body.scrollTop;
	return obj;
}
function flushAll(){
}

function captureScroll(e){
}
/*key input controll*/
function decodePressedKey(e){
    var code=e.keyCode;
	var string=String.fromCharCode(code).toLowerCase();
	//ignore ctr,alt,shift
	if(code == 16 || code == 17 || code ==18)
		return;
	
	if(event.keyCode==27){
		return "ESC";
	}
    if(event.ctrlKey){
    	string+="_ctr";
    }
    else if(event.shiftKey){
    	string+="_shift";
    }
    else if(event.altKey){
    	string+="_alt";
    }
    return string;
}
function captureKeydown(e){

	console.log("capturekey");
	e.stopPropagation();
	var string = decodePressedKey(e); 
	if(string){
		if(string=="ESC"){
			flushAll();
			return;
		}
		var func=keyEvent[string];
		if(func){
			func();
		}else{
			defaultfunc=keyEvent['default'];
			if(func)
				func();
		}
	}
}
function captureKeypress(e){
	e.stopPropagation();	
}
//commands
function yank(){
	console.log("yank");
	clipboard.yank();
}
function kill(){
	clipboard.kill();
}
